import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Ship, Anchor, MapPin, SearchCheck } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { alerts } = useAlert();
  
  const unhandledAlerts = alerts.filter(a => !a.isResolved);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Banner */}
      <div className="clay-card p-8 bg-gradient-to-br from-ocean-50 to-ocean-100/50 flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-ocean-900 mb-2 tracking-tight">
            Captain's Log — {user?.name || 'Fisherman'}
          </h2>
          <p className="text-slate-600 font-medium">
            Monitor your current catch limits and zone safety parameters below.
          </p>
        </div>
        <div className="w-20 h-20 clay-inset rounded-full flex items-center justify-center text-ocean-700 bg-white/40 shadow-sm relative z-10">
          <Ship size={36} />
        </div>
        <div className="absolute right-[10%] top-[-50%] w-64 h-64 bg-ocean-300/10 rounded-full blur-2xl z-0"></div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Today's Catch vs Limit */}
        <div className="clay-card p-8 flex flex-col justify-center gap-4 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full clay-inset flex items-center justify-center text-ocean-600 bg-ocean-50/50">
              <Anchor size={24} />
            </div>
            <h3 className="text-xl font-bold text-ocean-900 tracking-tight">Catch Status</h3>
          </div>
          
          <div className="clay-inset p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
             <div className="flex justify-between items-end z-10 relative">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Cod</span>
                <p className="text-2xl font-extrabold text-ocean-900">45 / <span className="text-ocean-400 text-lg">50</span></p>
             </div>
             
             {/* Dynamic limitation bar */}
             <div className="w-full h-3 bg-slate-200/50 rounded-full shadow-inner mt-2 overflow-hidden z-10 relative">
                <div className="h-full bg-gradient-to-r from-ocean-400 to-amber-400 w-[90%] rounded-full shadow-sm"></div>
             </div>
          </div>
        </div>

        {/* Active Zone Stats */}
        <div className="clay-card p-8 flex flex-col justify-center gap-4 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full clay-inset flex items-center justify-center text-green-600 bg-green-50/50">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold text-ocean-900 tracking-tight">Active Zone: Coastal Alpha</h3>
          </div>

          <div className="clay-inset p-5 rounded-2xl flex flex-col gap-3">
             <div className="flex justify-between items-center border-b border-ocean-100 pb-2">
                <span className="text-sm font-bold text-slate-500 uppercase">Population Health</span>
                <span className="text-green-600 font-extrabold">Good</span>
             </div>
             <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-bold text-slate-500 uppercase">Vessel Density</span>
                <span className="text-amber-500 font-extrabold">Moderate (14 / 20)</span>
             </div>
          </div>
        </div>
      </div>

       {/* Unresolved Alerts for Active Zone */}
       <div>
        <h3 className="text-2xl font-extrabold text-ocean-900 mb-6 px-1 flex items-center gap-3">
           <SearchCheck className="text-ocean-500" />
           Local Zone Alerts
        </h3>
        {unhandledAlerts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
             {unhandledAlerts.map(alert => (
               <div key={alert.id} className="clay-card p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <RiskBadge status={alert.severity} />
                     <span className="font-bold text-ocean-900">{alert.message}</span>
                  </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="clay-inset p-8 text-center text-slate-500 font-medium italic rounded-2xl">
            No active alerts in your current vicinity. Safe sailing!
          </div>
        )}
      </div>
    </div>
  );
};
