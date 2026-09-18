import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

async function check() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const users = await sql`
    SELECT u.id, u.email, u.full_name, u.is_active, array_agg(ur.role_id) as roles
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    GROUP BY u.id, u.email, u.full_name, u.is_active;
  `;
  console.log('CURRENT USERS IN DB:');
  console.log(JSON.stringify(users, null, 2));
  await sql.end();
}

check();
