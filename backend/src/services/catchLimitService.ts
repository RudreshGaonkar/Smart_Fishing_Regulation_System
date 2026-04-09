import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class CatchLimitService {
  /**
   * Evaluates if a catch is within limits, updates population, and logs to catch_records.
   */
  static async evaluateCatch(
    sessionId: number,
    speciesId: number,
    quantity: number,
    weightKg?: number,
    sizeCm?: number
  ): Promise<boolean> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Get session info to determine zone and role
      const [sessionRows] = await connection.query<RowDataPacket[]>(
        `SELECT s.zone_id, u.role, u.user_id 
         FROM fishing_sessions s 
         JOIN users u ON s.user_id = u.user_id 
         WHERE s.session_id = ?`,
        [sessionId]
      );
      if (sessionRows.length === 0) throw new Error('Session not found');
      const { zone_id, role, user_id } = sessionRows[0];

      // 2. Determine limits
      let maxPerTrip = Infinity;
      const [limits] = await connection.query<RowDataPacket[]>(
        `SELECT max_per_trip FROM catch_limits 
         WHERE (zone_id = ? OR zone_id IS NULL)
           AND (species_id = ? OR species_id IS NULL)
           AND (user_role = ? OR user_role = 'all')
           AND CURRENT_DATE BETWEEN effective_from AND IFNULL(effective_to, '9999-12-31')
         ORDER BY limit_id DESC LIMIT 1`,
        [zone_id, speciesId, role]
      );

      if (limits.length > 0 && limits[0].max_per_trip !== null) {
        maxPerTrip = limits[0].max_per_trip;
      } else {
        const [speciesRows] = await connection.query<RowDataPacket[]>(
          'SELECT daily_catch_limit FROM fish_species WHERE species_id = ?',
          [speciesId]
        );
        if (speciesRows.length > 0 && speciesRows[0].daily_catch_limit) {
          maxPerTrip = speciesRows[0].daily_catch_limit;
        }
      }

      // 3. Count catches already in this trip
      const [catchCountRows] = await connection.query<RowDataPacket[]>(
         'SELECT IFNULL(SUM(quantity), 0) as total FROM catch_records WHERE session_id = ? AND species_id = ?',
         [sessionId, speciesId]
      );
      const currentTripTotal = catchCountRows[0].total + quantity;
      
      const isWithinLimit = currentTripTotal <= maxPerTrip;

      // 4. Update fish_population
      await connection.query(
        'UPDATE fish_population SET current_stock = GREATEST(0, CAST(current_stock AS SIGNED) - ?) WHERE zone_id = ? AND species_id = ?',
        [quantity, zone_id, speciesId]
      );

      // 5. Insert to catch_records
      await connection.query<ResultSetHeader>(
        `INSERT INTO catch_records (session_id, species_id, quantity, weight_kg, size_cm, is_within_limit)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sessionId, speciesId, quantity, weightKg || null, sizeCm || null, isWithinLimit]
      );

      await connection.commit();
      return isWithinLimit;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
