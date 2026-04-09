import { Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middleware/authMiddleware';

// GET /api/analytics/population
// Returns population health % per species per zone — shaped for Recharts
export const getPopulationTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         fz.zone_name,
         fs.common_name  AS species_name,
         fp.current_stock,
         fp.estimated_total,
         fp.stock_percentage,
         fp.risk_status
       FROM fish_population fp
       JOIN fishing_zones fz  ON fp.zone_id    = fz.zone_id
       JOIN fish_species  fs  ON fp.species_id = fs.species_id
       ORDER BY fp.stock_percentage ASC
       LIMIT 50`
    );

    res.status(200).json(rows);
  } catch (error: any) {
    console.error('getPopulationTrends error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/analytics/catches
// Returns catch records joined with species name — shaped for Recharts
export const getCatchHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         cr.catch_id,
         cr.session_id,
         cr.species_id,
         cr.quantity,
         cr.weight_kg,
         cr.size_cm,
         cr.is_within_limit,
         cr.is_released,
         cr.caught_at,
         fs.common_name
       FROM catch_records cr
       JOIN fish_species fs ON cr.species_id = fs.species_id
       ORDER BY cr.caught_at DESC
       LIMIT 200`
    );

    res.status(200).json(rows);
  } catch (error: any) {
    console.error('getCatchHistory error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
