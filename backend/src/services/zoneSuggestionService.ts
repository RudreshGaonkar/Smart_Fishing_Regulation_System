import { pool } from '../config/db';
import { ZoneGraph } from '../dsa/graph';
import { RowDataPacket } from 'mysql2';

export class ZoneSuggestionService {
  static async suggestAlternativeZone(currentZoneId: number): Promise<{ recommendedZoneId: number | null, distance: number }> {
    // 1. Fetch graph edges natively
    const [adjRows] = await pool.query<RowDataPacket[]>('SELECT zone_from, zone_to, distance_km FROM zone_adjacency');
    
    // 2. Hydrate Adjacency Graph Map
    const graph = new ZoneGraph();
    for (const row of adjRows) {
      graph.addEdge(row.zone_from, row.zone_to, parseFloat(row.distance_km));
    }

    // 3. Evaluate Safe Zones 
    // Filter against zones actively unflagged for operation
    const [safeZoneRows] = await pool.query<RowDataPacket[]>('SELECT zone_id FROM fishing_zones WHERE zone_type = "open" AND is_active = 1');
    const safeZones = new Set<number>(safeZoneRows.map(r => r.zone_id));

    // 4. Trace utilizing Dijkstra PQ 
    const result = graph.findNearestSafeZone(currentZoneId, safeZones);
    return { recommendedZoneId: result.zoneId, distance: result.distance };
  }
}
