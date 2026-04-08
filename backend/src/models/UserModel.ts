import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UserRow extends RowDataPacket {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'fisherman' | 'admin' | 'researcher';
  full_name?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class UserModel {
  static async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  static async create(user: { username: string; email: string; password_hash: string; role: string; full_name?: string; phone?: string }): Promise<number> {
    const { username, email, password_hash, role, full_name, phone } = user;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password_hash, role, full_name || null, phone || null]
    );
    return result.insertId;
  }

  static async countAdmins(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    return rows[0].count;
  }
}
