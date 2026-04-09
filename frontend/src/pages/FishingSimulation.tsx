import React, { useState, useEffect } from 'react';
import { useFishingSession } from '../hooks/useFishingSession';
import { CatchForm } from '../components/CatchForm';
import MapView from '../components/MapView';
import { fetchZones } from '../services/dataService';
import type { FishingZone } from '../types/zone.types';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, Anchor, XCircle, Loader2 } from 'lucide-react';

export const FishingSimulation: React.FC = () => {
  const { session, startSession, endSession, isActive } = useFishingSession();
  const [zones, setZones] = useState<FishingZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(undefined);
  const [isLoadingZones, setIsLoadingZones] = useState(true);

  useEffect(() => {
    fetchZones()
      .then((data) => setZones(data))
      .catch(console.error)
      .finally(() => setIsLoadingZones(false));
  }, []);

  const handleStartSimulation = (zoneId: number, effortLevel: 'low' | 'medium' | 'high', departurePort: string) => {
    startSession({ zone_id: zoneId, effort_level: effortLevel, departure_port: departurePort });
  };

  return (
    <div className="flex flex-col gap-8 pb-12 h-full">
      <div className="px-1 shrink-0">
        <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Vessel Action Simulation</h2>
        <p className="text-slate-500 font-medium mt-1">Initiate a session to track catch bounds live, or explore zones safely on the mapping grid.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 items-start">

        {/* Left Column - Form & Controls */}
        <div className="flex flex-col gap-6 h-full">
          {session.error && (
            <div className="clay-card p-4 bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 rounded-2xl">
              <XCircle size={20} />
              <span className="font-semibold text-sm">{session.error}</span>
            </div>
          )}

          {!isActive ? (
            <CatchForm 
              zones={zones}
              onSubmit={handleStartSimulation} 
              onZoneSelect={setSelectedZoneId}
              isLoading={session.isLoading || isLoadingZones} 
            />
          ) : (
            <div className="clay-card p-8 w-full bg-ocean-50">
              <h3 className="text-2xl font-extrabold text-ocean-900 mb-4 flex items-center gap-3">
                Session Underway
              </h3>
              <div className="clay-inset rounded-2xl p-4 mb-6 flex flex-col gap-2 text-sm font-medium text-ocean-800">
                <p><span className="font-bold">Session ID:</span> #{session.sessionId}</p>
                <p><span className="font-bold">Zone ID:</span> {session.zoneId}</p>
                {session.departurePort && (
                  <p className="flex items-center gap-2">
                    <Anchor size={14} />
                    <span className="font-bold">Departed from:</span> {session.departurePort}
                  </p>
                )}
                <p><span className="font-bold">Effort:</span> {session.effortLevel}</p>
              </div>

              {/* Live Status readout inside the active state */}
              <div className="mb-6 flex flex-col gap-4">
                {session.lastCatchResult ? (
                  session.lastCatchResult.is_within_limit ? (
                     <div className="flex items-center gap-4 p-4 clay-inset rounded-2xl bg-green-50/80 border border-green-200">
                       <CheckCircle2 size={32} className="text-green-500 flex-shrink-0" />
                       <div>
                         <p className="font-bold text-green-900 text-lg">Within Limit</p>
                         <p className="text-sm text-green-800 font-medium">{session.lastCatchResult.message}</p>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-4 p-4 clay-inset rounded-2xl bg-red-50/80 border border-red-200">
                       <AlertTriangle size={32} className="text-red-500 flex-shrink-0" />
                       <div>
                         <p className="font-bold text-red-900 text-lg">Limit Exceeded</p>
                         <p className="text-sm text-red-800 font-medium">{session.lastCatchResult.message}</p>
                       </div>
                     </div>
                   )
                 ) : (
                   <div className="flex items-center gap-4 p-4 clay-inset rounded-2xl bg-white/50">
                     <CheckCircle2 size={32} className="text-green-500 flex-shrink-0" />
                     <div>
                       <p className="font-bold text-ocean-900 text-lg">Session Active</p>
                       <p className="text-sm text-slate-500 font-medium">Monitoring connection established.</p>
                     </div>
                   </div>
                 )}
              </div>

              <button
                onClick={endSession}
                className="clay-button w-full h-14 text-lg bg-gradient-to-br from-red-400 to-red-500 text-white border-red-300 shadow-[4px_4px_8px_#b6cedd,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#b6cedd,-2px_-2px_4px_#ffffff]"
              >
                Cease Operations
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Map / Targeting System */}
        <div className="h-full min-h-[500px]">
          <div className="clay-card p-4 h-full flex flex-col relative overflow-hidden bg-gradient-to-b from-white to-ocean-50/50">
            <div className="px-4 py-2 flex justify-between items-center shrink-0">
               <h2 className="text-xl font-extrabold text-ocean-900 flex items-center gap-2">
                 <Activity className="text-ocean-500" /> Tactical Grid View
               </h2>
               {isActive && (
                 <span className="bg-red-100/80 text-red-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest animate-pulse border border-red-200">
                   Live Tracking
                 </span>
               )}
            </div>
            
            <div className="flex-1 mt-2 relative rounded-2xl overflow-hidden">
               {isLoadingZones ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-ocean-50/80 z-10 backdrop-blur-sm">
                     <div className="flex flex-col items-center gap-3 text-ocean-600">
                        <Loader2 className="animate-spin" size={36} />
                        <span className="font-bold">Syncing Sattelite Data...</span>
                     </div>
                  </div>
               ) : (
                  <MapView 
                    zones={zones} 
                    highlightedZoneId={isActive ? (session.zoneId || selectedZoneId) : selectedZoneId} 
                  />
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
