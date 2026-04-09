import React from 'react';
import { APIProvider, Map, AdvancedMarker, MapMouseEvent, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { FishingZone } from '../types/zone.types';

interface ZoneCreationMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  lat?: number;
  lng?: number;
  existingZones?: FishingZone[];
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MapInner: React.FC<ZoneCreationMapProps> = ({ onLocationSelect, lat, lng, existingZones }) => {
  const geocodingLib = useMapsLibrary('geocoding');

  const handleMapClick = async (e: MapMouseEvent) => {
    if (e.detail.latLng) {
      const newLat = e.detail.latLng.lat;
      const newLng = e.detail.latLng.lng;
      let addressStr: string | undefined = undefined;

      if (geocodingLib) {
        try {
          const geocoder = new geocodingLib.Geocoder();
          const response = await geocoder.geocode({ location: { lat: newLat, lng: newLng } });
          if (response.results[0]) {
            const parts = response.results[0].address_components;
            const locality = parts.find(p => p.types.includes('locality'))?.long_name;
            const sublocality = parts.find(p => p.types.includes('sublocality'))?.long_name;
            addressStr = sublocality || locality || response.results[0].formatted_address.split(',')[0];
          }
        } catch (error) {
           console.error("Geocoding failed over map click", error);
        }
      }

      onLocationSelect(newLat, newLng, addressStr ? `Near ${addressStr}` : undefined);
    }
  };

  const center = lat && lng ? { lat, lng } : { lat: 15.4909, lng: 73.8278 };

  return (
    <Map
      defaultCenter={center}
      defaultZoom={9}
      mapId="DEMO_MAP_ID"
      gestureHandling="greedy"
      disableDefaultUI={true}
      onClick={handleMapClick}
    >
      {/* Existing Contextual Pins */}
      {existingZones?.map(zone => (
        <AdvancedMarker key={zone.zone_id} position={{ lat: Number(zone.latitude), lng: Number(zone.longitude) }}>
          <div className="w-3 h-3 bg-slate-400 rounded-full border border-white shadow-sm" title={`Existing: ${zone.zone_name}`} />
        </AdvancedMarker>
      ))}

      {/* Active Pin */}
      {lat && lng && (
        <AdvancedMarker position={{ lat, lng }}>
          <div className="w-5 h-5 bg-ocean-500 rounded-full border-2 border-white shadow-lg animate-bounce" title="New Zone" />
        </AdvancedMarker>
      )}
    </Map>
  );
};

export const ZoneCreationMap: React.FC<ZoneCreationMapProps> = (props) => {
  return (
    <div className="w-full h-48 rounded-xl overflow-hidden border border-ocean-200 relative mb-4">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <MapInner {...props} />
      </APIProvider>
      <div className="absolute bottom-2 left-2 right-2 flex justify-center pointer-events-none z-10">
        <span className="bg-white/80 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-ocean-800 shadow-sm border border-white/50">
          Click map to drop pin and geocode
        </span>
      </div>
    </div>
  );
};
