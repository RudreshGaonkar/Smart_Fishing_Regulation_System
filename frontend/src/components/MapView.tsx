import React from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

export interface FishingZone {
  zone_id: number;
  zone_name: string;
  zone_code?: string;
  latitude: number | string;
  longitude: number | string;
  zone_type: 'open' | 'restricted' | 'protected' | 'closed';
}

interface MapViewProps {
  zones: FishingZone[];
  highlightedZoneId?: number;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MapView: React.FC<MapViewProps> = ({ zones, highlightedZoneId }) => {
  const getZoneStyles = (type: string, isHighlighted: boolean) => {
    if (isHighlighted) {
      return { 
        border: 'border-cyan-400', 
        bg: 'bg-cyan-500/80', 
        shadow: 'shadow-[0_0_25px_rgba(34,211,238,0.9)]' 
      };
    }
    
    switch (type) {
      case 'open':
        return { border: 'border-green-400', bg: 'bg-green-500/30', shadow: '' };
      case 'restricted':
      case 'protected':
        return { border: 'border-yellow-400', bg: 'bg-yellow-500/30', shadow: '' };
      case 'closed':
        return { border: 'border-red-400', bg: 'bg-red-500/30', shadow: '' };
      default:
        return { border: 'border-gray-400', bg: 'bg-gray-500/30', shadow: '' };
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-[1.25rem] overflow-hidden shadow-lg border border-ocean-100 relative">
      {!GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-100 p-4 text-center">
          <p className="text-red-500 font-bold">Google Maps API Key completely missing from .env</p>
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
            const lat = Number(zone.latitude);
            const lng = Number(zone.longitude);

            if (isNaN(lat) || isNaN(lng)) return null;

            const styles = getZoneStyles(zone.zone_type, isHighlighted);

            return (
              <AdvancedMarker
                key={zone.zone_id}
                position={{ lat, lng }}
                title={zone.zone_name}
                zIndex={isHighlighted ? 100 : 1}
              >
                {/* Visual Grid Cell utilizing AdvancedMarker DOM projection */}
                <div 
                  className={`relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 transition-all duration-300 backdrop-blur-[2px] border-2 rounded-md ${styles.border} ${styles.bg} ${styles.shadow} ${isHighlighted ? 'scale-110 z-50 animate-pulse' : 'scale-100'}`}
                >
                  <div className="text-center pointer-events-none">
                    <p className={`font-extrabold text-[10px] sm:text-xs uppercase tracking-wider drop-shadow-md ${isHighlighted ? 'text-white' : 'text-slate-800'}`}>
                      {zone.zone_code || zone.zone_name}
                    </p>
                    {isHighlighted && (
                      <span className="bg-white text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block shadow-sm">
                        Selected Target
                      </span>
                    )}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapView;
