import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const ADMIN_EMAIL = 'admin@smartfishing.gov';
const ADMIN_USERNAME = 'master_admin';
const ADMIN_FULL_NAME = 'Master Administrator';
const ADMIN_DEFAULT_PASSWORD = 'SmartFish@Admin2024!';

async function seedAdmin(): Promise<void> {
  console.log('🌱 Starting Admin Seeder...');

  try {
    // 1. Check if admin already exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT user_id FROM users WHERE email = ? OR role = "admin" LIMIT 1',
      [ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      console.log('⚠️  Admin already exists in the database. Seeder aborted.');
      process.exit(0);
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, salt);

    // 3. Insert master admin
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (username, email, password_hash, role, full_name, is_active)
       VALUES (?, ?, ?, 'admin', ?, TRUE)`,
      [ADMIN_USERNAME, ADMIN_EMAIL, password_hash, ADMIN_FULL_NAME]
    );

    console.log(`✅  Master Admin created successfully!`);
    console.log(`   User ID : ${result.insertId}`);
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_DEFAULT_PASSWORD}`);
    console.log(`\n⚠️  IMPORTANT: Change this password immediately after first login.`);

  } catch (err: any) {
    console.error('❌ Seeder failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seedAdmin();
