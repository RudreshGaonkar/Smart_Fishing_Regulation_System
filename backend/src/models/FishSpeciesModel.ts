import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export interface FishSpeciesRow extends RowDataPacket {
  species_id: number;
  common_name: string;
  scientific_name: string;
  description: string;
  is_protected: boolean;
  risk_level: number;
  min_catch_size_cm: number;
  daily_catch_limit: number;
  season_start: string;
  season_end: string;
}

export class FishSpeciesModel {
  static async findAll(): Promise<FishSpeciesRow[]> {
    const [rows] = await pool.query<FishSpeciesRow[]>('SELECT * FROM fish_species');
    return rows;
  }
}
