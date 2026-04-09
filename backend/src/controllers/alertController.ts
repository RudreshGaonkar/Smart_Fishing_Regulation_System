import { Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middleware/authMiddleware';

// GET /api/alerts
export const getAllAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [alerts] = await pool.query<RowDataPacket[]>(
      `SELECT ra.*, fz.zone_name, fs.common_name AS species_name
       FROM risk_alerts ra
       LEFT JOIN fishing_zones fz ON ra.zone_id = fz.zone_id
       LEFT JOIN fish_species fs ON ra.species_id = fs.species_id
       ORDER BY ra.created_at DESC
       LIMIT 100`
    );
    res.status(200).json(alerts);
  } catch (error: any) {
    console.error('getAllAlerts error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/alerts/:id/resolve
export const resolveAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alertId = parseInt(req.params.id as string, 10);
    const adminId = req.user?.userId || req.user?.id || req.user?.user_id;

    if (isNaN(alertId)) {
      res.status(400).json({ error: 'Invalid alert ID' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE risk_alerts
       SET is_resolved = TRUE, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
       WHERE alert_id = ? AND is_resolved = FALSE`,
      [adminId, alertId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Alert not found or already resolved' });
      return;
    }

    res.status(200).json({ message: 'Alert resolved successfully', alert_id: alertId });
  } catch (error: any) {
    console.error('resolveAlert error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
