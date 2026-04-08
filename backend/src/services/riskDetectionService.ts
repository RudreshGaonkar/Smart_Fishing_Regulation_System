import { pool } from '../config/db';
import { SpeciesPriorityQueue, EndangeredSpecies } from '../dsa/priorityQueue';
import { RowDataPacket } from 'mysql2';

export class RiskDetectionService {
  static async getTopEndangeredSpecies(zoneId: number, limit: number = 3): Promise<EndangeredSpecies[]> {
    
    // 1. Join relationships calculating global stock dependencies
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        s.species_id, s.common_name as name, s.risk_level, 
        p.stock_percentage 
      FROM fish_species s
      JOIN fish_population p ON s.species_id = p.species_id
      WHERE p.zone_id = ?
    `, [zoneId]);

    // 2. Inject payloads into min-heap structure
    const pq = new SpeciesPriorityQueue();
    for (const row of rows) {
      pq.insert({
        species_id: row.species_id,
        name: row.name,
        risk_level: row.risk_level,
        stock_percentage: parseFloat(row.stock_percentage || '0')
      });
    }

    // 3. Sequentially pop absolute lowest ranking populations scaling up to limits
    const topEndangered: EndangeredSpecies[] = [];
    for (let i = 0; i < limit; i++) {
       const curr = pq.extractMostEndangered();
       if (curr) topEndangered.push(curr);
       else break;
    }
    
    return topEndangered;
  }
}
