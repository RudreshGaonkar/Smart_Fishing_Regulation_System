// ============================================================
// Monitoring Types — backend/src/types/monitoring.types.ts
// ============================================================

export interface ActiveSession {
  session_id: number;
  user_id: number;
  fisherman_name: string;
  zone_id: number;
  zone_name: string;
  latitude: number;
  longitude: number;
  started_at: string;        // ISO timestamp
  duration_minutes: number;  // TIMESTAMPDIFF result from MySQL
  effort_level: 'low' | 'medium' | 'high';
}
