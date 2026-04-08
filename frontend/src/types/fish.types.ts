export interface FishSpecies {
  species_id: number;
  common_name: string;
  scientific_name: string;
  description: string | null;
  is_protected: boolean;
  risk_level: number; // 0=least concern … 5=critically endangered
  min_catch_size_cm: number | null;
  daily_catch_limit: number | null;
  season_start: string | null;
  season_end: string | null;
  created_at: string;
  updated_at: string;
}

export type RiskStatus = 'safe' | 'warning' | 'critical' | 'depleted';

export interface FishPopulation {
  population_id: number;
  zone_id: number;
  species_id: number;
  current_stock: number;
  estimated_total: number | null;
  stock_percentage: number | null;
  risk_status: RiskStatus;
  last_surveyed: string | null;
  updated_at: string;
}
