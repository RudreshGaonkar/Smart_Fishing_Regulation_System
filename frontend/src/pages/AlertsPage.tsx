import React, { useState, useEffect } from 'react';
import { RiskBadge } from '../components/RiskBadge';
import type { RiskAlert } from '../types/alert.types';
import { useAuth } from '../context/AuthContext';
import { fetchAlerts, resolveAlert } from '../services/dataService';
import { BellRing, ShieldAlert, BadgeInfo, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

const ALERT_TYPE_LABELS: Record<string, string> = {
  low_stock:        'Low Stock',
  protected_catch:  'Protected Catch',
  limit_exceeded:   'Limit Exceeded',
  zone_closed:      'Zone Closed',
};

export const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [filterResolved, setFilterResolved] = useState<'all' | 'active' | 'resolved'>('active');

  useEffect(() => {
    fetchAlerts()
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleResolve = async (alertId: number) => {
    setResolvingId(alertId);
    try {
      await resolveAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => a.alert_id === alertId ? { ...a, is_resolved: true } : a)
      );
    } catch (err) {
      console.error('[AlertsPage] resolve error:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const filtered = alerts.filter((a) => {
    if (filterResolved === 'active')   return !a.is_resolved;
    if (filterResolved === 'resolved') return a.is_resolved;
    return true;
  });

  const criticalCount = alerts.filter(a => !a.is_resolved && a.severity === 'critical').length;
  const warningCount  = alerts.filter(a => !a.is_resolved && a.severity === 'warning').length;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1">
        <div>
          <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">System Alerts</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time risk tracking and ecosystem warnings.</p>
        </div>
        {/* Stats pills */}
        <div className="flex gap-2 flex-shrink-0">
          {criticalCount > 0 && (
            <span className="clay-inset px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="clay-inset px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              {warningCount} Warning
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-1">
        {(['active', 'all', 'resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterResolved(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
              filterResolved === tab
                ? 'clay-inset text-ocean-700 bg-ocean-100/50'
                : 'clay-button text-slate-500 hover:text-ocean-600'
            }`}
          >
            {tab === 'active' ? `Active (${alerts.filter(a => !a.is_resolved).length})` : tab === 'resolved' ? `Resolved (${alerts.filter(a => a.is_resolved).length})` : `All (${alerts.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5">
        {isLoading && (
          <div className="flex items-center gap-3 text-slate-500 font-medium italic px-1">
            <Loader2 size={16} className="animate-spin" /> Loading alerts...
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="clay-inset p-12 rounded-2xl text-center flex flex-col items-center gap-3">
            <AlertTriangle size={32} className="text-slate-300" />
            <p className="text-slate-500 font-medium">
              {filterResolved === 'active' ? 'No active alerts — all clear!' : 'No alerts found.'}
            </p>
          </div>
        )}

        {filtered.map((alert) => (
          <div
            key={alert.alert_id}
            className={`clay-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-opacity duration-300 ${
              alert.is_resolved ? 'opacity-55' : ''
            }`}
          >
            <div className="flex items-start gap-5 flex-1 min-w-0">
              {/* Severity icon */}
              <div className={`w-12 h-12 rounded-2xl clay-inset flex items-center justify-center shrink-0 ${
                alert.severity === 'critical' ? 'text-red-500 bg-red-50/50' :
                alert.severity === 'warning'  ? 'text-amber-500 bg-amber-50/50' :
                'text-blue-500 bg-blue-50/50'
              }`}>
                {alert.severity === 'critical' ? <ShieldAlert size={22} /> :
                 alert.severity === 'warning'  ? <BellRing size={22} /> :
                 <BadgeInfo size={22} />}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <RiskBadge status={alert.severity as any} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                    {ALERT_TYPE_LABELS[alert.alert_type] ?? alert.alert_type}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-ocean-900 leading-tight truncate">{alert.message}</h4>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Zone ID: <span className="font-bold text-ocean-700">#{alert.zone_id}</span>
                  {alert.species_id && (
                    <> · Species ID: <span className="font-bold text-ocean-700">#{alert.species_id}</span></>
                  )}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-col items-end shrink-0 w-full md:w-auto">
              {alert.is_resolved ? (
                <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-bold text-sm shadow-inner">
                  <CheckCircle size={14} /> Resolved
                </span>
              ) : isAdmin ? (
                <button
                  onClick={() => handleResolve(alert.alert_id)}
                  disabled={resolvingId === alert.alert_id}
                  className="clay-button w-full md:w-auto px-5 py-2 bg-ocean-500 text-white border-ocean-400 hover:bg-ocean-600 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resolvingId === alert.alert_id
                    ? <><Loader2 size={14} className="animate-spin" /> Resolving...</>
                    : <><CheckCircle size={14} /> Resolve</>
                  }
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-medium italic">Admin action required</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
