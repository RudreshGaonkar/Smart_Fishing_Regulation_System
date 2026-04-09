import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { Port } from '../types/port.types';

type PortRow = Port & RowDataPacket;

export class PortService {
  /**
   * Fetch all ports ordered alphabetically by name.
   */
  static async getAllPorts(): Promise<Port[]> {
    const [ports] = await pool.query<PortRow[]>('SELECT * FROM ports ORDER BY name ASC');
    return ports;
  }

  static async createPort(data: Omit<Port, 'port_id' | 'created_at'>): Promise<Port> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO ports (name, latitude, longitude) VALUES (?, ?, ?)',
      [data.name, data.latitude, data.longitude]
    );
    const [rows] = await pool.query<PortRow[]>('SELECT * FROM ports WHERE port_id = ?', [result.insertId]);
    return rows[0];
  }

  static async updatePort(id: number, data: Partial<Omit<Port, 'port_id' | 'created_at'>>): Promise<Port> {
    let query = 'UPDATE ports SET ';
    const params: any[] = [];
    if (data.name !== undefined) { query += 'name = ?, '; params.push(data.name); }
    if (data.latitude !== undefined) { query += 'latitude = ?, '; params.push(data.latitude); }
    if (data.longitude !== undefined) { query += 'longitude = ?, '; params.push(data.longitude); }
    
    // Remove trailing comma
    query = query.slice(0, -2);
    query += ' WHERE port_id = ?';
    params.push(id);

    await pool.query<ResultSetHeader>(query, params);
    
    const [rows] = await pool.query<PortRow[]>('SELECT * FROM ports WHERE port_id = ?', [id]);
    if (rows.length === 0) throw new Error('Port not found');
    return rows[0];
  }

  static async deletePort(id: number): Promise<void> {
    // Nullify port_id on any zones that were using this port
    await pool.query<ResultSetHeader>('UPDATE fishing_zones SET port_id = NULL WHERE port_id = ?', [id]);
    await pool.query<ResultSetHeader>('DELETE FROM ports WHERE port_id = ?', [id]);
  }
}
