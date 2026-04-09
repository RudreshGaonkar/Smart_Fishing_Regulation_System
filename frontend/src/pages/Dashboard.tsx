import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardStats, fetchAlerts } from '../services/dataService';
import type { DashboardStats } from '../services/dataService';
import type { RiskAlert } from '../types/alert.types';
import { Ship, Anchor, MapPin, SearchCheck, Activity, ShieldAlert, Fish, Loader2 } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [statsData, alertsData] = await Promise.all([
          fetchDashboardStats(),
          fetchAlerts()
        ]);
        
        if (active) {
          setStats(statsData);
          setAlerts(alertsData);
        }
      } catch (err: any) {
        if (active) {
          setError(err.response?.data?.error || err.message || 'Failed to sync with system API. Network offline.');
          setStats(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => { active = false; };
  }, []);

  const unhandledAlerts = alerts.filter((a) => !a.is_resolved);

  const statCards = stats
    ? [
        { label: 'Total Zones', value: stats.totalZones, icon: MapPin, color: 'text-ocean-600', bg: 'bg-ocean-50/50' },
        { label: 'Active Alerts', value: stats.activeAlerts, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50/50' },
        { label: 'Fish Species', value: stats.totalSpecies, icon: Fish, color: 'text-teal-600', bg: 'bg-teal-50/50' },
        { label: 'Active Sessions', value: stats.activeSessions, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50/50' },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Banner */}
      <div className="clay-card p-8 bg-gradient-to-br from-ocean-50 to-ocean-100/50 flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-ocean-900 mb-2 tracking-tight">
            {user?.role === 'admin' ? 'Admin Overview' : user?.role === 'researcher' ? 'Research Dashboard' : "Captain's Log"} — {user?.name || 'User'}
          </h2>
          <p className="text-slate-600 font-medium">
            {user?.role === 'fisherman'
              ? 'Monitor your catch limits and zone safety parameters below.'
              : 'System-wide metrics and pending alerts across all zones.'}
          </p>
        </div>
        <div className="w-20 h-20 clay-inset rounded-full flex items-center justify-center text-ocean-700 bg-white/40 shadow-sm relative z-10">
          <Ship size={36} />
        </div>
        <div className="absolute right-[10%] top-[-50%] w-64 h-64 bg-ocean-300/10 rounded-full blur-2xl z-0"></div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="clay-card p-12 flex flex-col items-center justify-center gap-4 text-ocean-600">
          <Loader2 size={40} className="animate-spin" />
          <p className="text-xl font-bold tracking-tight">Syncing Live Network Data...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="clay-card p-8 bg-red-50/80 border-l-4 border-red-500">
          <h3 className="text-2xl font-bold text-red-700 mb-2 flex items-center gap-2">
            <ShieldAlert /> System Unreachable
          </h3>
          <p className="text-red-600/80 font-medium">{error}</p>
        </div>
      )}

      {/* Stats Grid — Admin & Researcher */}
      {!isLoading && !error && stats && (user?.role === 'admin' || user?.role === 'researcher') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="clay-card p-6 flex flex-col gap-3">
              <div className={`w-11 h-11 rounded-full clay-inset flex items-center justify-center ${bg}`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-ocean-900">{value}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fisherman - personal session stats */}
      {!isLoading && !error && user?.role === 'fisherman' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="clay-card p-8 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full clay-inset flex items-center justify-center text-ocean-600 bg-ocean-50/50">
                <Anchor size={24} />
              </div>
              <h3 className="text-xl font-bold text-ocean-900 tracking-tight">Catch Status</h3>
            </div>
            <div className="clay-inset p-5 rounded-2xl text-center text-slate-500 italic font-medium">
              Start a session in the Simulation to track live catch data.
            </div>
          </div>

          <div className="clay-card p-8 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full clay-inset flex items-center justify-center text-green-600 bg-green-50/50">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-ocean-900 tracking-tight">
                Available Zones: {stats?.totalZones ?? '—'}
              </h3>
            </div>
            <div className="clay-inset p-5 rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase">Active Restrictions</span>
                <span className={`font-extrabold ${(stats?.activeAlerts ?? 0) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {stats?.activeAlerts ?? 0} Global Alerts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unresolved Alerts Module */}
      {!isLoading && !error && (
        <div>
          <h3 className="text-2xl font-extrabold text-ocean-900 mb-6 px-1 flex items-center gap-3">
            <SearchCheck className="text-ocean-500" />
            {user?.role === 'fisherman' ? 'Local System Broadcasts' : 'System-Wide Alerts'}
            {unhandledAlerts.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs shadow-sm">
                {unhandledAlerts.length} Pending
              </span>
            )}
          </h3>
          {unhandledAlerts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {unhandledAlerts.slice(0, 5).map((alert) => (
                <div key={alert.alert_id} className="clay-card p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <RiskBadge status={alert.severity as any} />
                    <div>
                      <span className="font-bold text-ocean-900 leading-tight block">{alert.message}</span>
                      <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wide">
                        Detection Date: {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="clay-inset p-8 text-center text-green-600/80 font-bold tracking-wide rounded-2xl flex flex-col items-center gap-2">
              <SearchCheck size={32} className="text-green-500 mb-2" />
              All sensors nominal. No active ecological alerts at this time.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
