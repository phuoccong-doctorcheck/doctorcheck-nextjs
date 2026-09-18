import * as dotenv from 'dotenv';
import { hash } from '@node-rs/argon2';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  outputLen: 32,
  parallelism: 4,
};

async function setAdminPassword() {
  const email = (process.argv[2] || 'admin@doctorcheck.vn').toLowerCase().trim();
  const password = process.argv[3] || 'DoctorCheck@2026!';

  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

  const passwordHash = await hash(password, ARGON2_OPTIONS);

  const result = await sql`
    UPDATE users 
    SET password_hash = ${passwordHash}, is_active = true, updated_at = NOW()
    WHERE email = ${email}
    RETURNING id, email, full_name;
  `;

  if (result.length === 0) {
    console.log(`User ${email} not found.`);
  } else {
    console.log(`✅ Successfully updated password for ${email} (${result[0].full_name})`);
    console.log(`🔑 New password: ${password}`);
  }

  await sql.end();
}

setAdminPassword();
