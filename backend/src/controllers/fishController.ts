import { Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middleware/authMiddleware';

// GET /api/fish
export const getAllSpecies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM fish_species ORDER BY common_name ASC'
    );
    res.status(200).json(rows);
  } catch (error: any) {
    console.error('getAllSpecies error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
