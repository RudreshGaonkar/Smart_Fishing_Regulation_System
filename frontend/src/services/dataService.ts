import { api } from './api';
import type { FishingZone } from '../types/zone.types';
import type { FishSpecies } from '../types/fish.types';
import type { RiskAlert } from '../types/alert.types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Port {
  port_id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface DashboardStats {
  totalZones: number;
  activeAlerts: number;
  totalSpecies: number;
  activeSessions: number;
}

export interface ActiveSession {
  session_id: number;
  user_id: number;           // raw FK from fishing_sessions
  fisherman_name: string;    // from JOIN on users
  zone_id: number;           // raw FK from fishing_sessions
  zone_name: string;         // from JOIN on fishing_zones
  latitude: number;
  longitude: number;
  started_at: string;
  duration_minutes: number;  // TIMESTAMPDIFF(MINUTE, started_at, NOW())
  effort_level: 'low' | 'medium' | 'high';
}

export interface CatchRecord {
  catch_id: number;
  session_id: number;
  species_id: number;
  quantity: number;
  weight_kg: number | null;
  size_cm: number | null;
  is_within_limit: boolean;
  is_released: boolean;
  caught_at: string;
  common_name?: string;
}

export interface PopulationTrend {
  zone_name: string;
  species_name: string;
  stock_percentage: number;
  risk_status: string;
}

export interface CreateZonePayload {
  zone_name: string;
  zone_code: string;
  description?: string;
  latitude: number;
  longitude: number;
  area_km2?: number;
  depth_m?: number;
  zone_type: 'open' | 'restricted' | 'protected' | 'closed';
  water_type: 'ocean' | 'river' | 'estuary' | 'backwater';
  port_id?: number;
}

export interface CreateSpeciesPayload {
  common_name: string;
  scientific_name: string;
  description?: string;
  is_protected: boolean;
  risk_level: number;
  min_catch_size_cm?: number;
  daily_catch_limit?: number;
  initial_stock?: number;
  zone_id?: number;
}

export interface UpdateCatchLimitPayload {
  zone_id?: number;
  species_id?: number;
  user_role: 'fisherman' | 'researcher' | 'all';
  max_per_day: number;
  max_per_trip?: number;
  effective_from: string;
  effective_to?: string;
}

export interface StartSessionPayload {
  zone_id: number;
  effort_level: 'low' | 'medium' | 'high';
  departure_port?: string;
}

export interface LogCatchPayload {
  species_id: number;
  quantity: number;
  weight_kg?: number;
  size_cm?: number;
}

// ── Admin / CRUD ──────────────────────────────────────────────────────────────

export const createZone = async (payload: CreateZonePayload): Promise<FishingZone> => {
  const { data } = await api.post('/admin/zones', payload);
  return data;
};

export const updateZone = async (zoneId: number, payload: Partial<CreateZonePayload>): Promise<FishingZone> => {
  const { data } = await api.put(`/admin/zones/${zoneId}`, payload);
  return data;
};

export const createSpecies = async (payload: CreateSpeciesPayload): Promise<FishSpecies> => {
  const { data } = await api.post('/admin/fish', payload);
  return data;
};

export const updateCatchLimit = async (payload: UpdateCatchLimitPayload): Promise<void> => {
  await api.post('/admin/catch-limits', payload);
};

export const resolveAlert = async (alertId: number): Promise<void> => {
  await api.patch(`/alerts/${alertId}/resolve`);
};

// ── Shared / Read ─────────────────────────────────────────────────────────────

export const fetchZones = async (): Promise<FishingZone[]> => {
  const { data } = await api.get('/zones');
  return data;
};

export const fetchAlerts = async (): Promise<RiskAlert[]> => {
  const { data } = await api.get('/alerts');
  return data;
};

export const fetchSpecies = async (): Promise<FishSpecies[]> => {
  const { data } = await api.get('/fish');
  return data;
};

export const fetchPorts = async (): Promise<Port[]> => {
  const { data } = await api.get('/admin/ports').catch(() => ({ data: [] }));
  return data;
};

export const fetchActiveSessions = async (): Promise<ActiveSession[]> => {
  const { data } = await api.get('/admin/monitoring/active').catch(() => ({ data: [] }));
  return data;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Aggregate from individual fast endpoints
  const [zones, alerts, species] = await Promise.all([
    fetchZones(),
    fetchAlerts(),
    fetchSpecies(),
  ]);
  return {
    totalZones: zones.length,
    activeAlerts: alerts.filter((a) => !a.is_resolved).length,
    totalSpecies: species.length,
    activeSessions: 0, // Expand when sessions list endpoint exists
  };
};

// ── Simulation ────────────────────────────────────────────────────────────────

export interface MyActiveSession {
  session_id: number;
  user_id: number;
  zone_id: number;
  zone_name: string;
  departure_port: string | null;
  effort_level: 'low' | 'medium' | 'high';
  status: 'active';
  started_at: string;
}

export const fetchMyActiveSession = async (): Promise<MyActiveSession | null> => {
  const { data } = await api.get<{ activeSession: MyActiveSession | null }>('/sessions/me/active');
  return data.activeSession;
};

export const startSession = async (payload: StartSessionPayload) => {
  const { data } = await api.post('/sessions', payload);
  return data as { session_id: number; zone_id: number; departure_port?: string; effort_level: string; message: string };
};

export const logCatch = async (sessionId: number, payload: LogCatchPayload) => {
  const { data } = await api.post(`/sessions/${sessionId}/catch`, payload);
  return data as { is_within_limit: boolean; message: string };
};

// ── Research ──────────────────────────────────────────────────────────────────

export const fetchCatchHistory = async (): Promise<CatchRecord[]> => {
  const { data } = await api.get('/analytics/catches').catch(() => ({ data: [] }));
  return data;
};

export const fetchPopulationTrends = async (): Promise<PopulationTrend[]> => {
  const { data } = await api.get('/analytics/population').catch(() => ({ data: [] }));
  return data;
};
