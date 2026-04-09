// ============================================================
// Port Controller — backend/src/controllers/portController.ts
// ============================================================
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { PortService } from '../services/portService';

/**
 * GET /api/admin/ports
 * Returns all registered ports. Admin-only.
 */
export const getAllPorts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ports = await PortService.getAllPorts();
    res.status(200).json(ports);
  } catch (error: any) {
    console.error('[portController] getAllPorts error:', error.message);
    res.status(500).json({ error: 'Internal server error while fetching ports' });
  }
};
