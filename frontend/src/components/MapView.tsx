import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export interface FishingZone {
  zone_id: number;
  zone_name: string;
  latitude: number | string;
  longitude: number | string;
  zone_type: 'open' | 'restricted' | 'protected' | 'closed';
}

interface MapViewProps {
  zones: FishingZone[];
  suggestedZoneId?: number;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MapView: React.FC<MapViewProps> = ({ zones, suggestedZoneId }) => {
  const getZoneColor = (type: string) => {
    switch (type) {
      case 'open':
        return '#22c55e'; // Green
      case 'restricted':
      case 'protected':
        return '#eab308'; // Yellow
      case 'closed':
        return '#ef4444'; // Red
      default:
        return '#aaaaaa'; // Gray fallback
    }
  };

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-white/20">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={{ lat: 15.4909, lng: 73.8278 }} // Coast of India
          defaultZoom={11}
          mapId="DEMO_MAP_ID" // Required for AdvancedMarker
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          {zones.map((zone) => {
            const isSuggested = zone.zone_id === suggestedZoneId;
            const lat = Number(zone.latitude);
            const lng = Number(zone.longitude);

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <AdvancedMarker
                key={zone.zone_id}
                position={{ lat, lng }}
                title={zone.zone_name}
                zIndex={isSuggested ? 100 : 1}
              >
                <div className="relative flex items-center justify-center">
                  {/* Glowing effect for suggested zone */}
                  {isSuggested && (
                    <div className="absolute w-12 h-12 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                  )}
                  
                  {/* Pin customization */}
                  <Pin
                    background={isSuggested ? '#3b82f6' : getZoneColor(zone.zone_type)}
                    borderColor={isSuggested ? '#1d4ed8' : '#ffffff'}
                    glyphColor={isSuggested ? '#bfdbfe' : '#ffffff'}
                    scale={isSuggested ? 1.4 : 1.1}
                  />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute top-10 w-max bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-semibold text-gray-800 shadow-md opacity-0 hover:opacity-100 transition-opacity">
                    {zone.zone_name} {isSuggested && '⭐ (Safest)'}
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
