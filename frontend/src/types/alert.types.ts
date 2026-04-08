export type AlertType = 'low_stock' | 'protected_catch' | 'limit_exceeded' | 'zone_closed';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface RiskAlert {
  alert_id: number;
  zone_id: number;
  species_id: number | null;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  is_resolved: boolean;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
}
