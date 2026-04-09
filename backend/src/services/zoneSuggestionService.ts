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

  // ── Dynamic Graph Edges (Haversine Formula) ───────────────────────────────

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static async calculateAndInsertEdges(newZoneId: number, lat: number, lng: number): Promise<void> {
    const [zones] = await pool.query<RowDataPacket[]>(
      'SELECT zone_id, latitude, longitude FROM fishing_zones WHERE zone_id != ?',
      [newZoneId]
    );

    if (zones.length === 0) return;

    interface ZoneDistance {
      zone_id: number;
      distance: number;
    }

    const distances: ZoneDistance[] = zones.map((z) => ({
      zone_id: z.zone_id,
      distance: this.calculateDistance(lat, lng, parseFloat(z.latitude), parseFloat(z.longitude))
    }));

    // Sort by distance ascending and take top 3 nearest nodes to maintain optimal graph density
    distances.sort((a, b) => a.distance - b.distance);
    const nearest = distances.slice(0, 3);

    const values: any[] = [];
    for (const n of nearest) {
      // Travel time roughly at 20 km/h average boat speed
      const travelTime = n.distance / 20;
      
      // Bidirectional inserts: Node A -> Node B AND Node B -> Node A
      values.push(
        [newZoneId, n.zone_id, n.distance, travelTime],
        [n.zone_id, newZoneId, n.distance, travelTime]
      );
    }

    if (values.length > 0) {
      // Bulk insert ignoring duplicates if edges accidentally overlap
      await pool.query(
        `INSERT INTO zone_adjacency (zone_from, zone_to, distance_km, travel_time_h) VALUES ?
         ON DUPLICATE KEY UPDATE distance_km = VALUES(distance_km), travel_time_h = VALUES(travel_time_h)`,
        [values]
      );
      console.log(`[ZoneSuggestion] Successfully calculated bridging edges for new Zone #${newZoneId}. Bound to ${nearest.length} nearest node(s).`);
    }
  }
}

