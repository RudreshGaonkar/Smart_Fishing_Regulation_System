import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middleware/authMiddleware';

export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?.user_id; // accommodate decoded token fields
    const { zone_id, effort_level, departure_port } = req.body;

    if (!userId || !zone_id || !effort_level) {
      res.status(400).json({ error: 'Missing required session parameters' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO fishing_sessions (user_id, zone_id, departure_port, effort_level, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [userId, zone_id, departure_port || null, effort_level]
    );

    res.status(201).json({
      message: 'Fishing session started successfully',
      session_id: result.insertId,
      zone_id,
      departure_port,
      effort_level
    });
  } catch (error: any) {
    console.error('startSession error:', error.message);
    res.status(500).json({ error: 'Internal server error while starting session' });
  }
};

// ── GET /sessions/me/active ───────────────────────────────────────────────────
export const getMyActiveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?.user_id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         fs.session_id,
         fs.user_id,
         fs.zone_id,
         fz.zone_name,
         fs.departure_port,
         fs.effort_level,
         fs.status,
         fs.started_at
       FROM fishing_sessions fs
       JOIN fishing_zones fz ON fz.zone_id = fs.zone_id
       WHERE fs.user_id = ? AND fs.status = 'active'
       ORDER BY fs.started_at DESC
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      res.status(200).json({ activeSession: null });
      return;
    }

    res.status(200).json({ activeSession: rows[0] });
  } catch (error: any) {
    console.error('getMyActiveSession error:', error.message);
    res.status(500).json({ error: 'Internal server error while fetching active session' });
  }
};
