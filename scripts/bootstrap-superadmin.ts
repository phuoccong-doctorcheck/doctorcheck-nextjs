import * as dotenv from 'dotenv';
import { hash } from '@node-rs/argon2';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: '.env.local' });

const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  outputLen: 32,
  parallelism: 4,
};

async function bootstrapSuperAdmin() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set in environment or .env.local');
    process.exit(1);
  }

  // Read credentials from environment variables or command-line arguments
  const email = (
    process.env.BOOTSTRAP_ADMIN_EMAIL ||
    process.argv.find((a) => a.startsWith('--email='))?.split('=')[1] ||
    'admin@doctorcheck.vn'
  )
    .toLowerCase()
    .trim();

  const password =
    process.env.BOOTSTRAP_ADMIN_PASSWORD ||
    process.argv.find((a) => a.startsWith('--password='))?.split('=')[1];

  const fullName =
    process.env.BOOTSTRAP_ADMIN_NAME ||
    process.argv.find((a) => a.startsWith('--name='))?.split('=')[1] ||
    'DoctorCheck Super Administrator';

  if (!password) {
    console.error('❌ ERROR: Password must be supplied via BOOTSTRAP_ADMIN_PASSWORD or --password=<password>');
    console.error('   Example: BOOTSTRAP_ADMIN_PASSWORD="StrongPassword123!" npx tsx scripts/bootstrap-superadmin.ts');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('❌ ERROR: Password must be at least 12 characters long for administrator accounts.');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('🛡️  CMS-1: SUPER_ADMIN Account Provisioning');
  console.log('====================================================');
  console.log(`📧 Target Account: ${email}`);
  console.log(`👤 Full Name:      ${fullName}`);
  console.log(`🔒 Password:       [SECURELY PROVIDED - LENGTH: ${password.length}]`);
  console.log('----------------------------------------------------');

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    // 1. Ensure 'super_admin' role exists in roles table
    const existingRoles = await sql<{ id: string }[]>`
      SELECT id FROM roles WHERE id = 'super_admin' LIMIT 1;
    `;

    if (!existingRoles.length) {
      console.log('📦 Seeding super_admin role into roles table...');
      await sql`
        INSERT INTO roles (id, name, description, permissions, created_at, updated_at)
        VALUES (
          'super_admin',
          'Super Administrator',
          'Full administrative control and system override',
          '[]'::jsonb,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 2. Check if user already exists
    const existingUsers = await sql<{ id: string; email: string; is_active: boolean }[]>`
      SELECT id, email, is_active FROM users WHERE email = ${email} LIMIT 1;
    `;

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      console.log(`⚠️  User account '${email}' already exists (ID: ${user.id}).`);
      console.log('🔍 Checking role assignments...');

      const userRoleCheck = await sql`
        SELECT * FROM user_roles WHERE user_id = ${user.id} AND role_id = 'super_admin';
      `;

      if (!userRoleCheck.length) {
        console.log("➕ Assigning 'super_admin' role to existing user...");
        await sql`
          INSERT INTO user_roles (user_id, role_id)
          VALUES (${user.id}, 'super_admin')
          ON CONFLICT DO NOTHING;
        `;
        console.log("✅ 'super_admin' role successfully attached.");
      } else {
        console.log("✅ User already possesses 'super_admin' role. No modifications made.");
      }

      console.log('====================================================');
      console.log('🎉 Super Administrator provisioning complete (Idempotent).');
      console.log('====================================================');
      await sql.end();
      process.exit(0);
    }

    // 3. Hash password using Argon2id
    console.log('🔐 Computing Argon2id cryptographic hash...');
    const passwordHash = await hash(password, ARGON2_OPTIONS);

    // 4. Insert user and user_roles in a transaction
    await sql.begin(async (tx) => {
      const [newUser] = await tx<{ id: string }[]>`
        INSERT INTO users (email, password_hash, full_name, is_active, created_at, updated_at)
        VALUES (${email}, ${passwordHash}, ${fullName}, true, NOW(), NOW())
        RETURNING id;
      `;

      await tx`
        INSERT INTO user_roles (user_id, role_id)
        VALUES (${newUser.id}, 'super_admin');
      `;

      await tx`
        INSERT INTO audit_logs (actor_id, actor_email, action, entity_type, entity_id, metadata, created_at)
        VALUES (
          ${newUser.id},
          ${email},
          'USER_BOOTSTRAP',
          'user',
          ${newUser.id},
          '{"bootstrapMethod":"CLI_SCRIPT"}'::jsonb,
          NOW()
        );
      `;

      console.log(`✅ Created Super Admin user successfully (ID: ${newUser.id})`);
    });

    console.log('====================================================');
    console.log('🎉 Super Administrator account successfully initialized!');
    console.log('====================================================');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Bootstrap failed:', error instanceof Error ? error.message : error);
    await sql.end({ timeout: 2 });
    process.exit(1);
  }
}

bootstrapSuperAdmin();
