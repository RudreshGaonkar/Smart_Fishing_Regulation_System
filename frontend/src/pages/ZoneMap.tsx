import React, { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import { fetchZones } from '../services/dataService';
import type { FishingZone } from '../types/zone.types';
import { Loader2 } from 'lucide-react';

export const ZoneMap: React.FC = () => {
  const [zones, setZones] = useState<FishingZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedZones = await fetchZones();
        setZones(fetchedZones);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to load zones from the API. Please ensure the backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[600px] pb-6">
      <div className="px-1 shrink-0">
        <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Global Zone Map</h2>
        <p className="text-slate-500 font-medium mt-1">Geographic overview of all designated fishing regions.</p>
      </div>

      <div className="flex-1 w-full h-full clay-card p-4 relative overflow-hidden">
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
               <p className="font-medium text-orange-500/80">There are currently no fishing zones recorded in the database. Add some from the Admin Panel.</p>
            </div>
          </div>
        ) : (
          /* Render real MapView component passing fetched zones */
          <MapView zones={zones} />
        )}
      </div>
    </div>
  );
};
