import React, { useState, useEffect } from 'react';
import { Target, Activity, Anchor, AlertTriangle } from 'lucide-react';
import type { FishingZone } from '../types/zone.types';

type EffortLevel = 'low' | 'medium' | 'high';

interface CatchFormProps {
  zones: FishingZone[];
  onSubmit: (zoneId: number, effortLevel: EffortLevel, departurePort: string) => void;
  onZoneSelect: (zoneId: number) => void;
  isLoading?: boolean;
}

export const CatchForm: React.FC<CatchFormProps> = ({ zones, onSubmit, onZoneSelect, isLoading }) => {
  const [zoneId, setZoneId] = useState<number>(0);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('medium');
  const [departurePort, setDeparturePort] = useState('');

  // Auto-select first zone when zones load if none selected
  useEffect(() => {
    if (zones.length > 0 && zoneId === 0) {
      setZoneId(zones[0].zone_id);
      onZoneSelect(zones[0].zone_id);
    }
  }, [zones, zoneId, onZoneSelect]);

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setZoneId(id);
    onZoneSelect(id);
  };

  const selectedZone = zones.find((z) => z.zone_id === zoneId);
  const isRestricted = selectedZone?.zone_type === 'restricted' || selectedZone?.zone_type === 'closed';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId || isRestricted) return;
    onSubmit(zoneId, effortLevel, departurePort);
  };

  return (
    <div className="clay-card p-8 w-full h-full flex flex-col">
      <h3 className="text-2xl font-extrabold text-ocean-900 mb-6 flex items-center gap-3 shrink-0">
        <Target size={24} className="text-ocean-600" />
        Log Fishing Session
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
        {/* Zone Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-ocean-800 ml-2 uppercase tracking-wide">Target Zone</label>
          <div className="clay-inset rounded-2xl relative">
            <select
              value={zoneId}
              onChange={handleZoneChange}
              className="w-full h-14 bg-transparent border-none outline-none px-4 text-slate-700 font-medium appearance-none z-10 relative cursor-pointer"
              disabled={isLoading || zones.length === 0}
            >
              {zones.length === 0 ? (
                <option>Loading zones...</option>
              ) : (
                zones.map((zone) => (
                  <option key={zone.zone_id} value={zone.zone_id}>
                    {zone.zone_name} ({zone.zone_type})
                  </option>
                ))
              )}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-ocean-500">▼</div>
          </div>
        </div>

        {/* Departure Port */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-ocean-800 ml-2 uppercase tracking-wide flex items-center gap-2">
            <Anchor size={16} /> Departure Port
          </label>
          <div className="clay-inset rounded-2xl">
            <input
              type="text"
              value={departurePort}
              onChange={(e) => setDeparturePort(e.target.value)}
              placeholder="e.g. Panaji Harbour, Goa"
              disabled={isLoading}
              required
              className="w-full h-14 bg-transparent border-none outline-none px-4 text-slate-700 font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Effort Level */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-ocean-800 ml-2 uppercase tracking-wide flex items-center gap-2">
            <Activity size={16} /> Effort Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['low', 'medium', 'high'] as EffortLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEffortLevel(level)}
                disabled={isLoading}
                className={`h-12 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                  effortLevel === level
                    ? 'clay-inset bg-ocean-100 text-ocean-700 ring-2 ring-ocean-400 border-none'
                    : 'clay-button bg-ocean-50/50 text-slate-500 hover:text-ocean-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Validation Warning */}
        {isRestricted && (
          <div className="clay-inset mt-2 bg-red-50/80 border border-red-200 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-red-900 text-sm">Fishing Prohibited</p>
              <p className="text-xs font-semibold text-red-800/80 mt-1">
                The {selectedZone?.zone_name} is currently marked as <span className="uppercase">{selectedZone?.zone_type}</span>. You cannot initiate a commercial session here.
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={isLoading || !zoneId || isRestricted}
            className="w-full clay-button h-14 text-lg bg-gradient-to-br from-ocean-400 to-ocean-500 text-white border-ocean-300 shadow-[6px_6px_12px_#b6cedd,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#b6cedd,-4px_-4px_8px_#ffffff] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Starting Session...' : 'Start Fishing'}
          </button>
        </div>
      </form>
    </div>
  );
};
