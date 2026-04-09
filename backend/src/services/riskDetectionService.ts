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

  static async evaluateBaselineRisk(speciesId: number, zoneId: number, riskLevel: string, status: string): Promise<void> {
    // ── Determine if an alert is warranted ────────────────────────────────────
    const numericRisk = parseInt(riskLevel, 10);
    const isCritical  = numericRisk >= 4 || riskLevel === 'critical';
    const isWarning   = numericRisk === 3 || riskLevel === 'warning';
    const isProtected = status === 'protected' || status === 'endangered';

    if (!isCritical && !isWarning && !isProtected) {
      return; // Species has an acceptable baseline — no alert required
    }

    // ── Fetch species name for a descriptive message ──────────────────────────
    const [speciesRows] = await pool.query<RowDataPacket[]>(
      `SELECT common_name FROM fish_species WHERE species_id = ?`,
      [speciesId]
    );
    const speciesName: string = speciesRows[0]?.common_name ?? `Species #${speciesId}`;

    // ── Build severity and message ────────────────────────────────────────────
    const severity: 'critical' | 'warning' = isCritical ? 'critical' : 'warning';

    let message: string;
    if (isProtected && isCritical) {
      message = `New Protected Species "${speciesName}" added with critical risk level (${numericRisk}/5) in Zone ${zoneId}. Immediate review required.`;
    } else if (isProtected) {
      message = `New Protected Species "${speciesName}" added with elevated risk level (${numericRisk}/5) in Zone ${zoneId}.`;
    } else {
      message = `New Species "${speciesName}" added with high baseline risk level (${numericRisk}/5) in Zone ${zoneId}. Population monitoring advised.`;
    }

    // ── Insert alert — always use low_stock per approved plan ────────────────
    try {
      await pool.query(
        `INSERT INTO risk_alerts (zone_id, species_id, alert_type, severity, message)
         VALUES (?, ?, 'low_stock', ?, ?)`,
        [zoneId, speciesId, severity, message]
      );
      console.log(`[RiskDetection] Baseline alert created for ${speciesName} in Zone ${zoneId} (${severity})`);
    } catch (insertError) {
      // Non-fatal: log and swallow — species creation must not be affected
      console.error('[RiskDetection] evaluateBaselineRisk failed to insert alert:', insertError);
    }
  }
}

