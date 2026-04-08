import React, { useState } from 'react';
import { useFishingSession } from '../hooks/useFishingSession';
import { CatchForm } from '../components/CatchForm';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RiskStatus } from '../types';

export const FishingSimulation: React.FC = () => {
  const { session, startSession, endSession, isActive } = useFishingSession();
  const [mockRisk, setMockRisk] = useState<RiskStatus>('safe');

  const handleStartSimulation = (zoneId: number, effortLevel: 'low' | 'medium' | 'high') => {
    startSession(zoneId, effortLevel);
    setMockRisk(zoneId === 2 ? 'warning' : zoneId === 3 ? 'critical' : 'safe');
  };

  return (
    <div className="flex flex-col gap-8 pb-12 h-full">
      <div className="px-1">
        <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Vessel Action Simulation</h2>
        <p className="text-slate-500 font-medium mt-1">Initiate operations and track theoretical catch boundaries locally.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 items-start">
        
        {/* Left Column - Target Select */}
        <div className="flex flex-col gap-6 h-full">
          {!isActive ? (
             <CatchForm onSubmit={handleStartSimulation} isLoading={session.expectedCatchCalculating} />
          ) : (
             <div className="clay-card p-8 w-full max-w-md bg-ocean-50">
                <h3 className="text-2xl font-extrabold text-ocean-900 mb-6 flex items-center gap-3">
                   Session Underway
                </h3>
                <p className="text-slate-600 font-medium mb-6">Fishing effort is currently assigned inside Zone {session.zoneId}.</p>
                <button 
                  onClick={endSession} 
                  className="clay-button w-full h-14 text-lg bg-gradient-to-br from-red-400 to-red-500 text-white border-red-300 shadow-[4px_4px_8px_#b6cedd,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#b6cedd,-2px_-2px_4px_#ffffff]"
                >
                  Cease Operations
                </button>
             </div>
          )}
        </div>

        {/* Right Column - Results Box */}
        <div className="h-full">
           <div className={`clay-card p-8 h-full transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95 pointer-events-none'}`}>
              <div className="flex justify-between items-center mb-8 border-b border-ocean-100 pb-4">
                 <h2 className="text-2xl font-extrabold text-ocean-900 flex items-center gap-2">
                    <Activity className="text-ocean-500" /> Live Results
                 </h2>
                 {isActive && (
                    <span className="bg-ocean-100 text-ocean-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest pulse-animation">
                       Monitoring
                    </span>
                 )}
              </div>

              {isActive ? (
                 <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 p-4 clay-inset rounded-2xl bg-white/50">
                       <CheckCircle2 size={32} className="text-green-500" />
                       <div>
                          <p className="font-bold text-ocean-900 text-lg">Within Limit</p>
                          <p className="text-sm text-slate-500 font-medium">Estimated trawl yield remains below local regulations.</p>
                       </div>
                    </div>
                    
                    {mockRisk !== 'safe' && (
                       <div className="flex items-center gap-4 p-4 clay-inset rounded-2xl bg-orange-50/80 border border-orange-200">
                          <ShieldAlert size={32} className="text-orange-500" />
                          <div>
                             <p className="font-bold text-orange-900 text-lg">System Flag Generated</p>
                             <p className="text-sm text-orange-800 font-medium">Reduced population index detected near your vectors.</p>
                          </div>
                       </div>
                    )}
                 </div>
              ) : (
                 <div className="flex items-center justify-center h-48 text-slate-400 italic font-medium">
                    Awaiting session start...
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
