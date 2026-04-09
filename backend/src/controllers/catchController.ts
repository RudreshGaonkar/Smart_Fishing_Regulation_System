import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { CatchLimitService } from '../services/catchLimitService';
import { RiskDetectionService } from '../services/riskDetectionService';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const recordCatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.id as string, 10);
    const { species_id, quantity, weight_kg, size_cm } = req.body;

    if (!sessionId || !species_id || quantity === undefined) {
       res.status(400).json({ error: 'Missing required parameters' });
       return;
    }

    // 1. Evaluate Catch
    const isWithinLimit = await CatchLimitService.evaluateCatch(
      sessionId,
      species_id,
      quantity,
      weight_kg,
      size_cm
    );

    // 2. Fetch session zone
    const [sessionRows] = await pool.query<RowDataPacket[]>(
      'SELECT zone_id FROM fishing_sessions WHERE session_id = ?',
      [sessionId]
    );
    if (sessionRows.length > 0) {
      // 3. Trigger Risk Detection
      const zoneId = sessionRows[0].zone_id;
      const endangeredList = await RiskDetectionService.getTopEndangeredSpecies(zoneId, 1);
      
      // If the caught species has fallen into endangered territory, or is top endangered, log or alert.
      // (For now, we just invoke it so the user can verify it's wired).
    }

    res.status(201).json({
      message: 'Catch recorded successfully',
      is_within_limit: isWithinLimit
    });
  } catch (error: any) {
    console.error('recordCatch error:', error.message);
    res.status(500).json({ error: 'Internal server error while recording catch' });
  }
};
