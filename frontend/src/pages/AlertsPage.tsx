import React, { useState } from 'react';
import { RiskBadge } from '../components/RiskBadge';
import { RiskAlert } from '../types';
import { useAuth } from '../context/AuthContext';
import { BellRing, ShieldAlert, BadgeInfo } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const isFisherman = user?.role === 'fisherman';

  // Mock Data
  const [alerts] = useState<RiskAlert[]>([
    {
      alert_id: 1, zone_id: 1, species_id: 2, alert_type: 'low_stock', 
      severity: 'critical', message: 'Bluefin Tuna stock dropped below 10%', 
      is_resolved: false, resolved_by: null, resolved_at: null, created_at: new Date().toISOString()
    },
    {
      alert_id: 2, zone_id: 3, species_id: null, alert_type: 'zone_closed', 
      severity: 'warning', message: 'Zone Gamma nearing maximum vessel capacity', 
      is_resolved: false, resolved_by: null, resolved_at: null, created_at: new Date().toISOString()
    },
    {
      alert_id: 3, zone_id: 2, species_id: 1, alert_type: 'limit_exceeded', 
      severity: 'info', message: 'System override: Minor quota exception granted', 
      is_resolved: true, resolved_by: 99, resolved_at: new Date().toISOString(), created_at: new Date().toISOString()
    }
  ]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="px-1 shrink-0 mb-2">
        <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">System Alerts</h2>
        <p className="text-slate-500 font-medium mt-1">Real-time risk tracking and ecosystem warnings.</p>
      </div>

      <div className="flex flex-col gap-6">
        {alerts.map((alert) => (
          <div 
            key={alert.alert_id} 
            className={`clay-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
              alert.is_resolved ? 'opacity-60' : ''
            }`}
          >
             <div className="flex items-start gap-5">
               <div className={`w-12 h-12 rounded-2xl clay-inset flex items-center justify-center shrink-0 ${
                  alert.severity === 'critical' ? 'text-red-500 bg-red-50/50' : 
                  alert.severity === 'warning' ? 'text-amber-500 bg-amber-50/50' : 'text-blue-500 bg-blue-50/50'
               }`}>
                  {alert.severity === 'critical' ? <ShieldAlert size={24} /> : 
                   alert.severity === 'warning' ? <BellRing size={24} /> : <BadgeInfo size={24} />}
               </div>
               
               <div className="flex flex-col">
                 <div className="flex items-center gap-3 mb-1">
                   <RiskBadge status={alert.severity as any} /> 
                   <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                     {new Date(alert.created_at).toLocaleDateString()}
                   </span>
                 </div>
                 <h4 className="text-xl font-bold text-ocean-900 leading-tight">{alert.message}</h4>
                 <p className="text-sm font-medium text-slate-500 mt-1">
                    Affected Zone ID: <span className="text-ocean-700">{alert.zone_id}</span>
                 </p>
               </div>
             </div>

             <div className="flex flex-col items-end shrink-0 w-full md:w-auto mt-2 md:mt-0">
               {alert.is_resolved ? (
                 <span className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-bold text-sm shadow-inner cursor-not-allowed">
                   Resolved
                 </span>
               ) : !isFisherman ? (
                 <button className="clay-button w-full md:w-auto px-6 py-2 bg-white/40 text-ocean-700 hover:text-ocean-900 font-bold border-white/60">
                   Acknowledge
                 </button>
               ) : null }
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
