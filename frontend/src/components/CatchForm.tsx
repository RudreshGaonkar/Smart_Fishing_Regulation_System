import React, { useState, useEffect } from 'react';
import { Target, Activity, Anchor, AlertTriangle } from 'lucide-react';
import type { FishingZone } from '../types/zone.types';
import { fetchZoneRecommendation, Port } from '../services/dataService';

type EffortLevel = 'low' | 'medium' | 'high';

interface CatchFormProps {
  zones: FishingZone[];
  ports: Port[];
  onSubmit: (zoneId: number, effortLevel: EffortLevel, departurePort: string) => void;
  onZoneSelect: (zoneId: number, recommendedZoneId?: number) => void;
  isLoading?: boolean;
}

export const CatchForm: React.FC<CatchFormProps> = ({ zones, ports, onSubmit, onZoneSelect, isLoading }) => {
  const [zoneId, setZoneId] = useState<number>(0);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('medium');
  const [selectedPortId, setSelectedPortId] = useState<number | ''>('');
  
  const [recommendation, setRecommendation] = useState<FishingZone | null>(null);
  const [lockoutReason, setLockoutReason] = useState<string>('');
  const [isFetchingRec, setIsFetchingRec] = useState(false);

  // Resolve Filtered Zones based on Port
  const filteredZones = selectedPortId !== '' 
    ? zones.filter(z => z.port_id === Number(selectedPortId))
    : zones;

  useEffect(() => {
    if (filteredZones.length > 0 && (!zoneId || !filteredZones.find(z => z.zone_id === zoneId))) {
      setZoneId(filteredZones[0].zone_id);
    }
  }, [filteredZones, zoneId]);

  // Hook into Zone Select to discover smart recommendations
  useEffect(() => {
    if (!zoneId) return;
    
    const zone = zones.find(z => z.zone_id === zoneId);
    if (!zone) return;

    if (zone.zone_type !== 'open') {
      setIsFetchingRec(true);
      fetchZoneRecommendation(zone.zone_id)
        .then(res => {
          setLockoutReason(res.message);
          setRecommendation(res.recommendation);
          onZoneSelect(zone.zone_id, res.recommendation?.zone_id);
        })
        .catch(err => {
          console.error(err);
          setLockoutReason('Ecological risk detected.');
          setRecommendation(null);
          onZoneSelect(zone.zone_id);
        })
        .finally(() => setIsFetchingRec(false));
    } else {
      setRecommendation(null);
      onZoneSelect(zone.zone_id);
    }
  }, [zoneId, zones, onZoneSelect]);

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setZoneId(Number(e.target.value));
  };

  const selectedZone = zones.find((z) => z.zone_id === zoneId);
  const isRestricted = selectedZone?.zone_type === 'restricted' || selectedZone?.zone_type === 'closed';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId || isRestricted) return;
    // Map portId to portName to satisfy old backend signature if needed
    const pName = ports.find(p => p.port_id === selectedPortId)?.name || 'Unknown Port';
    onSubmit(zoneId, effortLevel, pName);
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
              disabled={isLoading || filteredZones.length === 0}
            >
              {filteredZones.length === 0 ? (
                <option>No zones available from this port</option>
              ) : (
                filteredZones.map((zone) => (
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
          <div className="clay-inset rounded-2xl relative">
            <select
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={isLoading}
              required
              className="w-full h-14 bg-transparent border-none outline-none px-4 text-slate-700 font-medium appearance-none z-10 relative cursor-pointer"
            >
              <option value="" disabled>Select physical departure origin...</option>
              {ports.map(port => (
                <option key={port.port_id} value={port.port_id}>{port.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-ocean-500">▼</div>
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
          <div className="px-2 mt-1">
            {effortLevel === 'low' && <p className="text-xs font-semibold text-ocean-600">Sustainable. Minimal fuel usage. Best for ecosystem health.</p>}
            {effortLevel === 'medium' && <p className="text-xs font-semibold text-ocean-600">Standard commercial intensity. Moderate fuel usage.</p>}
            {effortLevel === 'high' && <p className="text-xs font-semibold text-orange-600">High-intensity. Maximum fuel usage. High risk of population impact.</p>}
          </div>
        </div>

        {/* Validation Warning & Smart Recommendation */}
        {isRestricted && (
          <div className="clay-inset mt-2 bg-red-50/80 border border-red-200 p-4 rounded-xl flex items-start gap-3 flex-col">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-red-900 text-sm">Fishing Prohibited</p>
                <p className="text-xs font-semibold text-red-800/80 mt-1">
                  You cannot fish here because: <span className="font-bold">{lockoutReason || 'Checking safety data...'}</span>
                </p>
              </div>
            </div>
            
            {recommendation && (
              <div className="mt-2 w-full bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-sm text-green-800 mb-2">
                  <span className="font-bold border-b border-green-300">Intelligent Recommendation</span><br/>
                  We recommend relocating to: <span className="font-black text-green-900">{recommendation.zone_name}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                     setZoneId(recommendation.zone_id);
                     setSelectedPortId(recommendation.port_id || '');
                  }}
                  className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm shadow-[2px_2px_4px_#b6cedd,-2px_-2px_4px_#ffffff] transition-all"
                >
                  Switch to Recommended Zone
                </button>
              </div>
            )}
            
            {isFetchingRec && (
               <p className="text-xs text-slate-500 animate-pulse mt-2 ml-8">Calculating nearest safe route...</p>
            )}
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
