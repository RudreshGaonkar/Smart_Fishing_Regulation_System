import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { FishingZone, WaterType } from '../types/zone.types';

interface MapViewProps {
  zones: FishingZone[];
  highlightedZoneId?: number;
  onZoneClick?: (zone: FishingZone) => void;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const ZONE_TYPE_STYLES: Record<string, { border: string; bg: string }> = {
  open:       { border: 'border-green-400',  bg: 'bg-green-500/25'  },
  restricted: { border: 'border-yellow-400', bg: 'bg-yellow-500/25' },
  protected:  { border: 'border-yellow-400', bg: 'bg-yellow-500/25' },
  closed:     { border: 'border-red-400',    bg: 'bg-red-500/25'    },
};

const WATER_TYPE_ICON: Record<WaterType, string> = {
  ocean:     '🌊',
  river:     '🏞️',
  estuary:   '🌿',
  backwater: '🪷',
};

const MapView: React.FC<MapViewProps> = ({ zones, highlightedZoneId, onZoneClick }) => {
  const [tooltipZoneId, setTooltipZoneId] = useState<number | null>(null);

  const getStyles = (type: string, isHighlighted: boolean) => {
    if (isHighlighted) {
      return { border: 'border-cyan-400', bg: 'bg-cyan-500/80', shadow: 'shadow-[0_0_25px_rgba(34,211,238,0.9)]' };
    }
    const base = ZONE_TYPE_STYLES[type] ?? { border: 'border-gray-400', bg: 'bg-gray-500/25' };
    return { ...base, shadow: '' };
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-[1.25rem] overflow-hidden shadow-lg border border-ocean-100 relative">
      {!GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-100 p-4 text-center">
          <p className="text-red-500 font-bold">Google Maps API Key missing from .env</p>
        </div>
      )}
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={{ lat: 15.4909, lng: 73.8278 }}
          defaultZoom={10}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          {zones.map((zone) => {
            const isHighlighted = zone.zone_id === highlightedZoneId;
            const isTooltipOpen = zone.zone_id === tooltipZoneId;
            const lat = Number(zone.latitude);
            const lng = Number(zone.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;

            const styles = getStyles(zone.zone_type, isHighlighted);
            const waterIcon = WATER_TYPE_ICON[zone.water_type] ?? '🌊';

            return (
              <AdvancedMarker
                key={zone.zone_id}
                position={{ lat, lng }}
                title={zone.zone_name}
                zIndex={isHighlighted ? 100 : isTooltipOpen ? 90 : 1}
                onClick={() => {
                  setTooltipZoneId(isTooltipOpen ? null : zone.zone_id);
                  onZoneClick?.(zone);
                }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Zone Marker Cell */}
                  <div
                    className={`
                      relative flex flex-col items-center justify-center w-24 h-24 sm:w-32 sm:h-32
                      transition-all duration-300 backdrop-blur-[2px] border-2 rounded-md cursor-pointer
                      ${styles.border} ${styles.bg} ${styles.shadow}
                      ${isHighlighted ? 'scale-110 z-50 animate-pulse' : 'scale-100 hover:scale-105'}
                    `}
                  >
                    <span className="text-base sm:text-xl">{waterIcon}</span>
                    <p className={`font-extrabold text-[9px] sm:text-[11px] uppercase tracking-wider drop-shadow-md text-center leading-tight mt-1 px-1 ${isHighlighted ? 'text-white' : 'text-slate-800'}`}>
                      {zone.zone_code}
                    </p>
                    {isHighlighted && (
                      <span className="bg-white text-cyan-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 shadow-sm">
                        Target
                      </span>
                    )}
                  </div>

                  {/* Tooltip on click */}
                  {isTooltipOpen && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 w-48 bg-white/95 backdrop-blur-sm border border-ocean-200 rounded-2xl shadow-xl p-3 pointer-events-none">
                      <p className="font-extrabold text-ocean-900 text-sm leading-tight">{zone.zone_name}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                          ${zone.zone_type === 'open' ? 'bg-green-100 text-green-700' :
                            zone.zone_type === 'closed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'}`}>
                          {zone.zone_type}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-ocean-100 text-ocean-700">
                          {waterIcon} {zone.water_type}
                        </span>
                      </div>
                      {zone.area_km2 && (
                        <p className="text-[10px] text-slate-500 font-medium mt-1.5">Area: {zone.area_km2} km²</p>
                      )}
                      {zone.depth_m && (
                        <p className="text-[10px] text-slate-500 font-medium">Depth: {zone.depth_m} m</p>
                      )}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-ocean-200 rotate-45" />
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 pointer-events-none z-10">
        <div className="bg-white/90 backdrop-blur-sm border border-ocean-100 rounded-2xl p-3 shadow-lg flex flex-col gap-1.5">
          {[
            { label: 'Open',       cls: 'bg-green-400'  },
            { label: 'Restricted', cls: 'bg-yellow-400' },
            { label: 'Closed',     cls: 'bg-red-400'    },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${cls}`} />
              <span className="text-[10px] font-bold text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;
