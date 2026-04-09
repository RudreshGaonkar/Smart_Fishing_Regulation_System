import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchActiveSessions } from '../services/dataService';
import type { ActiveSession } from '../services/dataService';
import { Activity, Clock, Fish, MapPin, RefreshCw, Waves, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { APIProvider, Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const EFFORT_STYLES: Record<string, string> = {
  low:    'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high:   'bg-red-100 text-red-700 border-red-200',
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

// ── Zone Grouping Type ────────────────────────────────────────────────────────
interface ZoneGroup {
  zone_id: number;
  zone_name: string;
  latitude: number;
  longitude: number;
  sessions: ActiveSession[];
}

export const MonitoringDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [expandedZones, setExpandedZones] = useState<Set<number>>(new Set());
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchActiveSessions();
      setSessions(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[MonitoringDashboard] fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load + auto-refresh every 30 seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  // ── Group sessions by zone_id ────────────────────────────────────────────
  const zoneGroups: ZoneGroup[] = useMemo(() => {
    const groupMap = new Map<number, ZoneGroup>();
    for (const session of sessions) {
      const existing = groupMap.get(session.zone_id);
      if (existing) {
        existing.sessions.push(session);
      } else {
        groupMap.set(session.zone_id, {
          zone_id: session.zone_id,
          zone_name: session.zone_name,
          latitude: session.latitude,
          longitude: session.longitude,
          sessions: [session],
        });
      }
    }
    return Array.from(groupMap.values());
  }, [sessions]);

  // ── Toggle zone expansion in sidebar ─────────────────────────────────────
  const toggleZoneExpanded = (zoneId: number) => {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }
      return next;
    });
  };

  // Determine the highest effort level in a zone for the marker color
  const getZoneMaxEffort = (group: ZoneGroup): 'low' | 'medium' | 'high' => {
    if (group.sessions.some((s) => s.effort_level === 'high')) return 'high';
    if (group.sessions.some((s) => s.effort_level === 'medium')) return 'medium';
    return 'low';
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 clay-inset rounded-2xl flex items-center justify-center text-ocean-600 bg-white/40">
            <Activity size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Live Monitoring</h2>
            <p className="text-slate-500 font-medium mt-1">
              Real-time tracking of active fishing sessions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">
            Refreshed: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={load}
            disabled={isRefreshing}
            className="clay-button px-4 py-2 rounded-xl text-ocean-700 font-bold flex items-center gap-2 hover:text-ocean-900 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Sessions', value: sessions.length, icon: <Activity size={20} />, color: 'text-ocean-600' },
          { label: 'Unique Zones', value: new Set(sessions.map(s => s.zone_id)).size, icon: <MapPin size={20} />, color: 'text-teal-600' },
          { label: 'Avg Duration', value: sessions.length ? `${Math.round(sessions.reduce((a, s) => a + s.duration_minutes, 0) / sessions.length)}m` : '—', icon: <Clock size={20} />, color: 'text-amber-600' },
          { label: 'High Effort', value: sessions.filter(s => s.effort_level === 'high').length, icon: <Waves size={20} />, color: 'text-red-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="clay-card p-5 flex flex-col gap-2">
            <div className={`${color} flex items-center gap-2`}>
              {icon}
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
            </div>
            <p className="text-2xl font-extrabold text-ocean-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Session List — Grouped by Zone */}
        <div className="lg:col-span-2 clay-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-ocean-900 flex items-center gap-2">
              <Users size={18} /> Fishermen at Sea
            </h3>
            {sessions.length > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">
                {sessions.length} Live
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium italic">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="clay-inset rounded-2xl p-8 text-center flex-1 flex flex-col items-center justify-center gap-2">
              <Fish size={32} className="text-slate-300" />
              <p className="text-slate-500 font-medium">No active sessions right now.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[480px] pr-1">
              {zoneGroups.map((group) => {
                const isExpanded = expandedZones.has(group.zone_id);
                const maxEffort = getZoneMaxEffort(group);
                return (
                  <div key={group.zone_id} className="clay-inset rounded-2xl overflow-hidden transition-all duration-200">
                    {/* Zone Header — clickable to expand/collapse */}
                    <button
                      onClick={() => toggleZoneExpanded(group.zone_id)}
                      className="w-full text-left p-4 flex justify-between items-center gap-2 hover:bg-white/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`
                          w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0
                          ${maxEffort === 'high' ? 'bg-red-500' : maxEffort === 'medium' ? 'bg-amber-500' : 'bg-green-500'}
                        `}>
                          {group.sessions.length}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-ocean-900 text-sm leading-tight truncate">
                            {group.zone_name}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                            <Users size={10} className="text-ocean-400 flex-shrink-0" />
                            {group.sessions.length} {group.sessions.length === 1 ? 'Fisherman' : 'Fishermen'} Active
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${EFFORT_STYLES[maxEffort] ?? ''}`}>
                          {maxEffort === 'high' ? '⚠ High' : maxEffort}
                        </span>
                        {isExpanded
                          ? <ChevronDown size={16} className="text-slate-400" />
                          : <ChevronRight size={16} className="text-slate-400" />}
                      </div>
                    </button>

                    {/* Expanded: Individual fisherman rows */}
                    {isExpanded && (
                      <div className="border-t border-white/50 bg-white/20">
                        {group.sessions.map((session) => {
                          const isSelected = selectedSession?.session_id === session.session_id;
                          return (
                            <button
                              key={session.session_id}
                              onClick={() => setSelectedSession(isSelected ? null : session)}
                              className={`
                                w-full text-left px-4 py-3 flex justify-between items-center gap-2
                                border-b border-white/30 last:border-b-0 transition-all duration-150
                                ${isSelected ? 'bg-ocean-50/50 ring-1 ring-inset ring-ocean-300' : 'hover:bg-white/30'}
                              `}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
                                <div className="min-w-0">
                                  <p className="font-bold text-ocean-900 text-sm truncate">{session.fisherman_name}</p>
                                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                    <Clock size={9} />
                                    {formatDuration(session.duration_minutes)}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${EFFORT_STYLES[session.effort_level] ?? ''}`}>
                                {session.effort_level}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Map */}
        <div className="lg:col-span-3 clay-card p-4 min-h-[480px] flex flex-col gap-3">
          <h3 className="text-lg font-extrabold text-ocean-900 flex items-center gap-2 px-2">
            <MapPin size={18} /> Live Positions
          </h3>
          <div className="flex-1 rounded-2xl overflow-hidden min-h-[400px]">
            {!GOOGLE_MAPS_API_KEY ? (
              <div className="h-full flex items-center justify-center bg-slate-100 rounded-2xl">
                <p className="text-red-500 font-bold text-sm">Google Maps API Key missing</p>
              </div>
            ) : (
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  defaultCenter={{ lat: 15.4909, lng: 73.8278 }}
                  defaultZoom={9}
                  mapId="DEMO_MAP_ID"
                  gestureHandling="greedy"
                  disableDefaultUI={true}
                >
                  {zoneGroups.map((group) => {
                    const lat = Number(group.latitude);
                    const lng = Number(group.longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;
                    const isSelected = selectedZoneId === group.zone_id;
                    const maxEffort = getZoneMaxEffort(group);
                    const count = group.sessions.length;
                    return (
                      <AdvancedMarker
                        key={group.zone_id}
                        position={{ lat, lng }}
                        zIndex={isSelected ? 100 : 1}
                        onClick={() => setSelectedZoneId(isSelected ? null : group.zone_id)}
                      >
                        <div className={`
                          relative flex flex-col items-center transition-transform
                          ${isSelected ? 'scale-125' : 'hover:scale-110'}
                        `}>
                          {/* Marker Circle — shows count badge */}
                          <div className={`
                            w-11 h-11 rounded-full border-2 flex items-center justify-center
                            shadow-lg text-white text-xs font-extrabold
                            ${maxEffort === 'high' ? 'bg-red-500 border-red-300' :
                              maxEffort === 'medium' ? 'bg-amber-500 border-amber-300' :
                              'bg-green-500 border-green-300'}
                            ${isSelected ? 'ring-4 ring-white ring-opacity-70' : ''}
                          `}>
                            🚢
                          </div>

                          {/* Fisherman Count Badge */}
                          {count > 1 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ocean-600 border-2 border-white flex items-center justify-center shadow-md">
                              <span className="text-[9px] font-extrabold text-white leading-none">{count}</span>
                            </div>
                          )}

                          {/* Info Tooltip — shows all fishermen when zone is selected */}
                          {isSelected && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full bg-white/95 border border-ocean-200 rounded-xl px-3.5 py-2.5 shadow-xl min-w-[180px] max-w-[260px] pointer-events-none z-50">
                              <p className="text-xs font-extrabold text-ocean-900 mb-1.5 flex items-center gap-1.5">
                                <MapPin size={11} className="text-ocean-400" />
                                {group.zone_name}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 mb-1">
                                {count} {count === 1 ? 'Fisherman' : 'Fishermen'} Active
                              </p>
                              <div className="flex flex-col gap-1">
                                {group.sessions.map((s) => (
                                  <div key={s.session_id} className="flex justify-between items-center gap-2 bg-slate-50/80 rounded-lg px-2 py-1">
                                    <span className="text-[10px] font-bold text-ocean-800 truncate">{s.fisherman_name}</span>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${EFFORT_STYLES[s.effort_level] ?? ''}`}>
                                        {s.effort_level}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-medium">{formatDuration(s.duration_minutes)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {/* Tooltip Arrow */}
                              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-ocean-200 rotate-45" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute -inset-2 rounded-full border-2 border-cyan-400 animate-ping opacity-50 pointer-events-none" />
                          )}
                        </div>
                      </AdvancedMarker>
                    );
                  })}
                </GoogleMap>
              </APIProvider>
            )}
          </div>
        </div>
      </div>

      {/* Selected Session Detail */}
      {selectedSession && (
        <div className="clay-card p-6 border-l-4 border-ocean-400">
          <h4 className="text-base font-extrabold text-ocean-900 mb-4 flex items-center gap-2">
            <Fish size={16} /> Session Detail — {selectedSession.fisherman_name}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Session ID', value: `#${selectedSession.session_id}` },
              { label: 'Zone', value: selectedSession.zone_name },
              { label: 'Started At', value: new Date(selectedSession.started_at).toLocaleTimeString() },
              { label: 'Duration', value: formatDuration(selectedSession.duration_minutes) },
              { label: 'Effort Level', value: selectedSession.effort_level },
              { label: 'Latitude', value: Number(selectedSession.latitude).toFixed(5) + '°N' },
              { label: 'Longitude', value: Number(selectedSession.longitude).toFixed(5) + '°E' },
            ].map(({ label, value }) => (
              <div key={label} className="clay-inset rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="font-extrabold text-ocean-900 mt-0.5 capitalize">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
