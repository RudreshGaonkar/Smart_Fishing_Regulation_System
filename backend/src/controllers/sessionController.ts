import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader } from 'mysql2';
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
