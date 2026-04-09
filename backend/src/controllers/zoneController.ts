import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { ZoneGraph } from '../dsa/graph';
import { ZoneSuggestionService } from '../services/zoneSuggestionService';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAllZones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [zones] = await pool.query<RowDataPacket[]>('SELECT * FROM fishing_zones');
    res.status(200).json(zones);
  } catch (error: any) {
    console.error('getAllZones error:', error.message);
    res.status(500).json({ error: 'Internal server error while fetching zones' });
  }
};

export const getSafeAlternatives = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const zoneId = parseInt(req.params.id as string, 10);
    if (isNaN(zoneId)) {
      res.status(400).json({ error: 'Invalid zone ID' });
      return;
    }

    // 1. Fetch graph edges (zone_adjacency)
    const [edges] = await pool.query<RowDataPacket[]>('SELECT zone_from, zone_to, distance_km FROM zone_adjacency');

    // 2. Load into graph
    const graph = new ZoneGraph();
    for (const edge of edges) {
      graph.addEdge(edge.zone_from, edge.zone_to, parseFloat(edge.distance_km));
    }

    // 3. Fetch all safe zones (zones where there are no 'critical' or 'depleted' populations)
    // Note: Here we assume a logic to define "safe" zones, e.g., zone_type = 'open' or no active alerts.
    // Simplifying: we find zones with 'open' status.
    const [safeZoneRows] = await pool.query<RowDataPacket[]>("SELECT zone_id FROM fishing_zones WHERE zone_type = 'open'");
    const safeZonesSet = new Set<number>();
    for (const z of safeZoneRows) safeZonesSet.add(z.zone_id);

    // 4. Run Dijkstra
    const result = graph.findNearestSafeZone(zoneId, safeZonesSet);

    if (result.zoneId === null) {
      res.status(404).json({ message: 'No safe alternative zones found.' });
      return;
    }

    // 5. Fetch details of suggested safe zone
    const [zoneDetails] = await pool.query<RowDataPacket[]>('SELECT * FROM fishing_zones WHERE zone_id = ?', [result.zoneId]);

    res.status(200).json({
      suggested_zone: zoneDetails[0],
      distance_km: result.distance
    });

  } catch (error: any) {
    console.error('getSafeAlternatives error:', error.message);
    res.status(500).json({ error: 'Internal server error while finding safe alternatives' });
  }
};

export const getRecommendation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const zoneId = parseInt(req.params.id as string, 10);
    if (isNaN(zoneId)) {
      res.status(400).json({ error: 'Invalid zone ID' });
      return;
    }

    // Use our BFS implementation wrapped intelligently in the service layer
    const { recommendedZoneId, distance } = await ZoneSuggestionService.suggestAlternativeZone(zoneId);

    // Grab the actual reason why they are locked out (the unresolved alert driving the exclusion)
    const [alerts] = await pool.query<RowDataPacket[]>(
      `SELECT message FROM risk_alerts WHERE zone_id = ? AND is_resolved = FALSE ORDER BY created_at DESC LIMIT 1`,
      [zoneId]
    );
    const alertMessage = alerts.length > 0 ? alerts[0].message : 'Geographic area currently flagged for ecological recovery protocols.';

    if (recommendedZoneId === null) {
      res.status(404).json({ message: alertMessage, recommendation: null });
      return;
    }

    const [zoneDetails] = await pool.query<RowDataPacket[]>('SELECT * FROM fishing_zones WHERE zone_id = ?', [recommendedZoneId]);

    res.status(200).json({
      message: alertMessage,
      recommendation: zoneDetails[0],
      distance_km: distance
    });

  } catch (error: any) {
    console.error('getRecommendation error:', error.message);
    res.status(500).json({ error: 'Internal server error while resolving Zone Graph Path' });
  }
};
