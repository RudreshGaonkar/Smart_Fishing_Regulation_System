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

export const createPort = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const port = await PortService.createPort(req.body);
    res.status(201).json(port);
  } catch (error: any) {
    console.error('[portController] createPort error:', error.message);
    res.status(500).json({ error: 'Internal server error while creating port' });
  }
};

export const updatePort = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const port = await PortService.updatePort(parseInt(req.params.id as string, 10), req.body);
    res.status(200).json(port);
  } catch (error: any) {
    console.error('[portController] updatePort error:', error.message);
    res.status(500).json({ error: 'Internal server error while updating port' });
  }
};

export const deletePort = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const portId = parseInt(req.params.id as string, 10);
    await PortService.deletePort(portId);
    res.status(204).send();
  } catch (error: any) {
    console.error('[portController] deletePort error:', error.message);
    res.status(500).json({ error: 'Internal server error while deleting port' });
  }
};
