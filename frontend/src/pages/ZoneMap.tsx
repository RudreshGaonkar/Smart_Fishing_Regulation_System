import React, { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import { fetchZones } from '../services/dataService';
import type { FishingZone } from '../types/zone.types';
import { Loader2, X, Waves, Anchor, MapPin } from 'lucide-react';

const WATER_LABELS: Record<string, string> = {
  ocean: '🌊 Ocean',
  river: '🏞️ River',
  estuary: '🌿 Estuary',
  backwater: '🪷 Backwater',
};

const ZONE_TYPE_COLORS: Record<string, string> = {
  open:       'bg-green-100 text-green-800 border-green-200',
  restricted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  protected:  'bg-amber-100 text-amber-800 border-amber-200',
  closed:     'bg-red-100 text-red-800 border-red-200',
};

export const ZoneMap: React.FC = () => {
  const [zones, setZones] = useState<FishingZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<FishingZone | null>(null);

  useEffect(() => {
    fetchZones()
      .then(setZones)
      .catch((err: any) => setError(err.response?.data?.error || err.message || 'Failed to load zones.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[600px] pb-6">
      <div className="px-1 shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Global Zone Map</h2>
          <p className="text-slate-500 font-medium mt-1">
            Geographic overview of all designated fishing regions. Click a zone to inspect.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500 clay-inset px-4 py-2 rounded-xl">
          {zones.length} zones loaded
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Map */}
        <div className="flex-1 clay-card p-4 relative overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-ocean-600 gap-3">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-lg font-bold">Loading satellite data & zones...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center clay-inset p-8 rounded-2xl bg-red-50/50 max-w-lg">
                <p className="text-xl font-bold text-red-600 mb-2">Error Displaying Map</p>
                <p className="font-medium text-red-500/80">{error}</p>
              </div>
            </div>
          ) : zones.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center clay-inset p-8 rounded-2xl bg-orange-50/50 max-w-lg">
                <p className="text-xl font-bold text-orange-600 mb-2">No Zones Recorded</p>
                <p className="font-medium text-orange-500/80">Add zones from the Admin Panel.</p>
              </div>
            </div>
          ) : (
            <MapView
              zones={zones}
              highlightedZoneId={selectedZone?.zone_id}
              onZoneClick={setSelectedZone}
            />
          )}
        </div>

        {/* Zone Detail Panel */}
        {selectedZone && (
          <div className="w-72 shrink-0 clay-card p-6 flex flex-col gap-5 overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-extrabold text-ocean-900 leading-tight pr-2">{selectedZone.zone_name}</h3>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize border ${ZONE_TYPE_COLORS[selectedZone.zone_type] ?? 'bg-slate-100 text-slate-700'}`}>
                {selectedZone.zone_type}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full capitalize border bg-ocean-50 text-ocean-700 border-ocean-200">
                {WATER_LABELS[selectedZone.water_type] ?? selectedZone.water_type}
              </span>
            </div>

            <div className="clay-inset rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-ocean-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Code</p>
                  <p className="font-bold text-ocean-900">{selectedZone.zone_code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Waves size={14} className="text-ocean-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Coordinates</p>
                  <p className="font-bold text-ocean-900 font-mono text-xs">
                    {Number(selectedZone.latitude).toFixed(4)}°N, {Number(selectedZone.longitude).toFixed(4)}°E
                  </p>
                </div>
              </div>
              {selectedZone.area_km2 && (
                <div className="flex items-center gap-2 text-sm">
                  <Anchor size={14} className="text-ocean-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Area</p>
                    <p className="font-bold text-ocean-900">{selectedZone.area_km2} km²</p>
                  </div>
                </div>
              )}
              {selectedZone.depth_m && (
                <div className="flex items-center gap-2 text-sm">
                  <Waves size={14} className="text-teal-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Avg Depth</p>
                    <p className="font-bold text-ocean-900">{selectedZone.depth_m} m</p>
                  </div>
                </div>
              )}
            </div>

            {selectedZone.description && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedZone.description}</p>
              </div>
            )}

            <div className="mt-auto">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${selectedZone.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <span className={`w-2 h-2 rounded-full ${selectedZone.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                {selectedZone.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
