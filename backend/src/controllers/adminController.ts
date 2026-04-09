import { Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middleware/authMiddleware';

// POST /api/admin/zones
export const createZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { zone_name, zone_code, description, latitude, longitude, area_km2, depth_m, zone_type, water_type, port_id } = req.body;

    if (!zone_name || !zone_code || latitude === undefined || longitude === undefined || !zone_type) {
      res.status(400).json({ error: 'Missing required fields: zone_name, zone_code, latitude, longitude, zone_type' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO fishing_zones (zone_name, zone_code, description, latitude, longitude, area_km2, depth_m, zone_type, water_type, port_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [zone_name, zone_code, description || null, latitude, longitude, area_km2 || null, depth_m || null, zone_type, water_type || 'ocean', port_id || null]
    );

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM fishing_zones WHERE zone_id = ?', [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Zone code already exists' });
      return;
    }
    console.error('createZone error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/fish
export const createSpecies = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const {
      common_name, scientific_name, description, is_protected,
      risk_level, min_catch_size_cm, daily_catch_limit,
      initial_stock, zone_id, // optional: seed initial population
    } = req.body;

    if (!common_name || !scientific_name) {
      res.status(400).json({ error: 'Missing required fields: common_name, scientific_name' });
      return;
    }

    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO fish_species (common_name, scientific_name, description, is_protected, risk_level, min_catch_size_cm, daily_catch_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [common_name, scientific_name, description || null, is_protected ? 1 : 0,
       risk_level ?? 0, min_catch_size_cm || null, daily_catch_limit || null]
    );

    const speciesId = result.insertId;

    // Seed population row if zone_id is provided
    if (zone_id && initial_stock !== undefined) {
      await connection.query(
        `INSERT INTO fish_population (zone_id, species_id, current_stock, estimated_total, risk_status)
         VALUES (?, ?, ?, ?, 'safe')
         ON DUPLICATE KEY UPDATE current_stock = VALUES(current_stock)`,
        [zone_id, speciesId, initial_stock, initial_stock]
      );
    }

    await connection.commit();

    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM fish_species WHERE species_id = ?', [speciesId]);
    res.status(201).json(rows[0]);

  } catch (error: any) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Species with this scientific name already exists' });
      return;
    }
    console.error('createSpecies error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// POST /api/admin/catch-limits
export const setCatchLimit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.userId || req.user?.id || req.user?.user_id;
    const { zone_id, species_id, user_role, max_per_day, max_per_trip, effective_from, effective_to } = req.body;

    if (!max_per_day || !user_role || !effective_from) {
      res.status(400).json({ error: 'Missing required fields: user_role, max_per_day, effective_from' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO catch_limits (zone_id, species_id, user_role, max_per_day, max_per_trip, effective_from, effective_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [zone_id || null, species_id || null, user_role, max_per_day,
       max_per_trip || null, effective_from, effective_to || null, adminId]
    );

    res.status(201).json({ message: 'Catch limit set successfully', limit_id: result.insertId });
  } catch (error: any) {
    console.error('setCatchLimit error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/admin/zones/:id
export const updateZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const zoneId = parseInt(req.params.id as string, 10);
    const { zone_name, zone_code, description, latitude, longitude, area_km2, depth_m, zone_type, water_type, port_id, is_active } = req.body;

    if (isNaN(zoneId)) {
      res.status(400).json({ error: 'Invalid zone ID' });
      return;
    }

    await pool.query(
      `UPDATE fishing_zones
       SET zone_name = COALESCE(?, zone_name),
           zone_code = COALESCE(?, zone_code),
           description = COALESCE(?, description),
           latitude = COALESCE(?, latitude),
           longitude = COALESCE(?, longitude),
           area_km2 = COALESCE(?, area_km2),
           depth_m = COALESCE(?, depth_m),
           zone_type = COALESCE(?, zone_type),
           water_type = COALESCE(?, water_type),
           port_id = COALESCE(?, port_id),
           is_active = COALESCE(?, is_active)
       WHERE zone_id = ?`,
      [zone_name, zone_code, description, latitude, longitude, area_km2, depth_m, zone_type, water_type, port_id, is_active, zoneId]
    );

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM fishing_zones WHERE zone_id = ?', [zoneId]);
    res.status(200).json(rows[0]);
  } catch (error: any) {
    console.error('updateZone error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/admin/zones/:id
export const deleteZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const zoneId = parseInt(req.params.id as string, 10);
    if (isNaN(zoneId)) {
      res.status(400).json({ error: 'Invalid zone ID' });
      return;
    }

    await pool.query('DELETE FROM fishing_zones WHERE zone_id = ?', [zoneId]);
    res.status(200).json({ message: 'Zone deleted successfully' });
  } catch (error: any) {
    console.error('deleteZone error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

