// ============================================================
// Zone Types — frontend/src/types/zone.types.ts
// ============================================================

export type ZoneType = 'open' | 'restricted' | 'protected' | 'closed';
export type WaterType = 'ocean' | 'river' | 'estuary' | 'backwater';

export interface FishingZone {
  zone_id: number;
  zone_name: string;
  zone_code: string;
  description: string | null;
  latitude: number;
  longitude: number;
  area_km2: number | null;
  depth_m: number | null;
  zone_type: ZoneType;
  water_type: WaterType;
  port_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZoneAdjacency {
  adjacency_id: number;
  zone_from: number;
  zone_to: number;
  distance_km: number;
  travel_time_h: number | null;
  created_at: string;
}
