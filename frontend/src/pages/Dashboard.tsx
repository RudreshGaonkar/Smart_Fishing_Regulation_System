import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFishingSessionContext } from '../context/FishingSessionContext';
import { fetchAlerts, fetchActiveSessions, fetchZones, fetchSpecies } from '../services/dataService';
import type { DashboardStats } from '../services/dataService';
import type { RiskAlert } from '../types/alert.types';
import {
  Ship, Anchor, MapPin, SearchCheck, Activity, ShieldAlert,
  Fish, Loader2, Radio, Clock, Navigation,
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

// ── helpers ───────────────────────────────────────────────────────────────────

const formatDuration = (startedAt: string): string => {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
  if (diff < 1) return 'Just started';
  if (diff === 1) return '1 min';
  if (diff < 60) return `${diff} mins`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeSession, isSessionActive, isInitializing: isSessionInitializing } = useFishingSessionContext();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live duration ticker — updates every minute while a session is active
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isSessionActive) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [isSessionActive]);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [alertsData] = await Promise.all([fetchAlerts()]);

        // Fetch system-wide active sessions count only for admin/researcher
        let activeSessions = 0;
        if (user?.role === 'admin' || user?.role === 'researcher') {
          try {
            const sessions = await fetchActiveSessions();
            activeSessions = sessions.length;
          } catch {
            /* non-critical */
          }
        }

        // Derive stats from what we have
        const [zones, species] = await Promise.all([fetchZones(), fetchSpecies()]);

        if (active) {
          setStats({
            totalZones: zones.length,
            activeAlerts: alertsData.filter((a) => !a.is_resolved).length,
            totalSpecies: species.length,
            activeSessions,
          });
          setAlerts(alertsData);
        }
      } catch (err: any) {
        if (active) {
          setError(err.response?.data?.error || err.message || 'Failed to sync with system API. Network offline.');
          setStats(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, [user?.role]);

  const unhandledAlerts = alerts.filter((a) => !a.is_resolved);

  const statCards = stats
    ? [
        { label: 'Total Zones',     value: stats.totalZones,     icon: MapPin,      color: 'text-ocean-600', bg: 'bg-ocean-50/50' },
        { label: 'Active Alerts',   value: stats.activeAlerts,   icon: ShieldAlert, color: 'text-red-500',   bg: 'bg-red-50/50'   },
        { label: 'Fish Species',    value: stats.totalSpecies,    icon: Fish,        color: 'text-teal-600',  bg: 'bg-teal-50/50'  },
        { label: 'Active Sessions', value: stats.activeSessions,  icon: Activity,    color: 'text-amber-500', bg: 'bg-amber-50/50' },
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
        <div className="absolute right-[10%] top-[-50%] w-64 h-64 bg-ocean-300/10 rounded-full blur-2xl z-0" />
      </div>

      {/* Loading State */}
      {(isLoading || isSessionInitializing) && (
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

      {/* ── FISHERMAN: Active Session Card ─────────────────────────────────── */}
      {!isLoading && !isSessionInitializing && !error && user?.role === 'fisherman' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Active Session Panel */}
          <div className="clay-card p-8 flex flex-col gap-4 relative overflow-hidden">
            {/* Ambient glow when active */}
            {isSessionActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-ocean-400/5 to-teal-400/10 pointer-events-none rounded-[inherit]" />
            )}

            <div className="flex items-center gap-3 mb-1 relative z-10">
              <div className={`w-12 h-12 rounded-full clay-inset flex items-center justify-center ${isSessionActive ? 'bg-teal-50/60 text-teal-600' : 'bg-ocean-50/50 text-ocean-600'}`}>
                <Anchor size={24} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-ocean-900 tracking-tight">Current Session</h3>
                {isSessionActive && (
                  <span className="flex items-center gap-1.5 bg-teal-100 text-teal-700 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-teal-200 animate-pulse">
                    <Radio size={9} /> Live
                  </span>
                )}
              </div>
            </div>

            {isSessionActive && activeSession ? (
              <div className="clay-inset rounded-2xl p-5 flex flex-col gap-3 relative z-10">
                {/* Zone */}
                <div className="flex items-start gap-3">
                  <Navigation size={16} className="text-ocean-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Fishing Zone</p>
                    <p className="font-extrabold text-ocean-900 text-base leading-tight">
                      {activeSession.zone_name || `Zone #${activeSession.zone_id}`}
                    </p>
                  </div>
                </div>

                {/* Departure Port */}
                {activeSession.departure_port && (
                  <div className="flex items-start gap-3">
                    <Anchor size={16} className="text-ocean-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Departed From</p>
                      <p className="font-bold text-slate-700 text-sm">{activeSession.departure_port}</p>
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-ocean-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Duration</p>
                    <p className="font-bold text-slate-700 text-sm">{formatDuration(activeSession.started_at)}</p>
                  </div>
                </div>

                {/* Effort */}
                <div className="mt-1 pt-3 border-t border-ocean-100/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Effort Level</span>
                  <span className={`font-extrabold text-sm px-3 py-1 rounded-full ${
                    activeSession.effort_level === 'high'
                      ? 'bg-red-100 text-red-700'
                      : activeSession.effort_level === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {activeSession.effort_level.charAt(0).toUpperCase() + activeSession.effort_level.slice(1)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="clay-inset p-5 rounded-2xl text-center text-slate-400 italic font-medium relative z-10">
                No active session. Start one in the <span className="font-bold text-ocean-600 not-italic">Simulation</span> tab.
              </div>
            )}
          </div>

          {/* Zone Overview Card */}
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

      {/* ── ADMIN & RESEARCHER: Stats Grid ─────────────────────────────────── */}
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

      {/* ── Unresolved Alerts Module ────────────────────────────────────────── */}
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
