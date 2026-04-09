// ============================================================
// Monitoring Service — backend/src/services/monitoringService.ts
// ============================================================
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import type { ActiveSession } from '../types/monitoring.types';

type ActiveSessionRow = ActiveSession & RowDataPacket;

export class MonitoringService {
  /**
   * Fetch all active (status='active') fishing sessions.
   * Duration is computed in MySQL via TIMESTAMPDIFF(MINUTE, started_at, NOW()).
   */
  static async getActiveSessions(): Promise<ActiveSession[]> {
    const query = `
      SELECT
        fs.session_id,
        fs.user_id,
        u.full_name            AS fisherman_name,
        fs.zone_id,
        fz.zone_name,
        fz.latitude,
        fz.longitude,
        fs.started_at,
        TIMESTAMPDIFF(MINUTE, fs.started_at, NOW()) AS duration_minutes,
        fs.effort_level
      FROM fishing_sessions fs
      JOIN users         u  ON fs.user_id = u.user_id
      JOIN fishing_zones fz ON fs.zone_id = fz.zone_id
      WHERE fs.status = 'active'
      ORDER BY fs.started_at DESC
    `;
    const [sessions] = await pool.query<ActiveSessionRow[]>(query);
    return sessions;
  }
}
