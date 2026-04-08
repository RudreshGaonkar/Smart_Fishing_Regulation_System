import React from 'react';
import { MapPin, Plus, Minus } from 'lucide-react';

interface MapViewProps {
  isLoading?: boolean;
  selectedZoneId?: number | null;
}

export const MapView: React.FC<MapViewProps> = ({ isLoading = false, selectedZoneId = null }) => {
  return (
    <div className="w-full h-full min-h-[450px] clay-card p-3 flex flex-col relative overflow-hidden">
      {/* Soft overlay simulating the map area */}
      <div className="clay-inset w-full h-full rounded-[1.25rem] flex flex-col items-center justify-center bg-ocean-100/50 relative overflow-hidden">
        
        {/* Placeholder Custom 'Map' Graphic */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
           backgroundImage: 'radial-gradient(circle at 20% 30%, #0284c7 1px, transparent 1px), radial-gradient(circle at 80% 60%, #0284c7 1px, transparent 1px)',
           backgroundSize: '40px 40px'
        }}></div>

        {/* Central Content */}
        <div className="flex flex-col items-center gap-4 text-ocean-600 z-10">
          <div className={`p-4 rounded-full ${isLoading ? 'animate-pulse bg-ocean-200/50' : 'bg-ocean-200/80 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.7),inset_-2px_-2px_5px_rgba(0,0,0,0.05)]'}`}>
             <MapPin size={40} className={isLoading ? 'opacity-80 animate-bounce' : 'opacity-100 text-ocean-700'} />
          </div>
          
          <h3 className="text-xl font-bold tracking-tight text-ocean-800">
            {isLoading 
              ? 'Loading Map Data...' 
              : selectedZoneId 
                ? `Zone ID: ${selectedZoneId} Selected` 
                : 'Select a Zone on the Map'}
          </h3>
          
          <p className="text-sm text-ocean-700/70 max-w-xs text-center leading-relaxed">
            Placeholder container for the Google Maps API. The Graph / Map integration will render within this soft claymorphism bounds.
          </p>
        </div>

        {/* Decorative elements representing map controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3">
          <button className="clay-button w-12 h-12 rounded-2xl flex items-center justify-center p-0" aria-label="Zoom In">
            <Plus size={20} className="text-ocean-700 flex-shrink-0" />
          </button>
          <button className="clay-button w-12 h-12 rounded-2xl flex items-center justify-center p-0" aria-label="Zoom Out">
            <Minus size={20} className="text-ocean-700 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
