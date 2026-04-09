// ============================================================
// Monitoring Controller — backend/src/controllers/monitoringController.ts
// ============================================================
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { MonitoringService } from '../services/monitoringService';

/**
 * GET /api/admin/monitoring/active
 * Returns all active fishing sessions with duration. Admin-only.
 */
export const getActiveSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await MonitoringService.getActiveSessions();
    res.status(200).json(sessions);
  } catch (error: any) {
    console.error('[monitoringController] getActiveSessions error:', error.message);
    res.status(500).json({ error: 'Internal server error while fetching active sessions' });
  }
};
