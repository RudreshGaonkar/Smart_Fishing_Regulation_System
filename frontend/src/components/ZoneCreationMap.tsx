import React from 'react';
import { APIProvider, Map, AdvancedMarker, MapMouseEvent } from '@vis.gl/react-google-maps';

interface ZoneCreationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  lat?: number;
  lng?: number;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const ZoneCreationMap: React.FC<ZoneCreationMapProps> = ({ onLocationSelect, lat, lng }) => {
  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail.latLng) {
      onLocationSelect(e.detail.latLng.lat, e.detail.latLng.lng);
    }
  };

  const center = lat && lng ? { lat, lng } : { lat: 15.4909, lng: 73.8278 };

  return (
    <div className="w-full h-48 rounded-xl overflow-hidden border border-ocean-200 relative mb-4">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={9}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={true}
          onClick={handleMapClick}
        >
          {lat && lng && (
            <AdvancedMarker position={{ lat, lng }}>
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-bounce" title="New Zone" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
      <div className="absolute bottom-2 left-2 right-2 flex justify-center pointer-events-none">
        <span className="bg-white/80 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-ocean-800 shadow-sm border border-white/50">
          Click map to drop pin
        </span>
      </div>
    </div>
  );
};
