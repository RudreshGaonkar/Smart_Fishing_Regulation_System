// ============================================================
// Port Service — backend/src/services/portService.ts
// ============================================================
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
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
}
