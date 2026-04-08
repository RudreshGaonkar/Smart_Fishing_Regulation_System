import React, { useState } from 'react';
import { RiskBadge } from '../components/RiskBadge';
import { Settings, Edit2, CheckCircle, ShieldAlert } from 'lucide-react';
import { RiskStatus } from '../types';

export const AdminPanel: React.FC = () => {
  const [limits] = useState([
    { id: 1, limit: '5 Tuna/day', scope: 'Zone Alpha', status: 'active' },
    { id: 2, limit: 'No Trawling', scope: 'Zone Beta (Protected)', status: 'active' },
    { id: 3, limit: '10 Cod/day', scope: 'Global', status: 'pending_review' },
  ]);

  const [alerts] = useState([
    { id: 101, message: 'Stock depleted in Zone Coastal-9', severity: 'critical' as RiskStatus, date: 'Oct 14' },
    { id: 102, message: 'Overfishing limit approached (Zone Alpha)', severity: 'warning' as RiskStatus, date: 'Oct 14' },
  ]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 clay-inset rounded-2xl flex items-center justify-center text-ocean-600 bg-white/40">
             <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Administrator Panel</h2>
            <p className="text-slate-500 font-medium mt-1">Manage global closures and regulatory alerts.</p>
          </div>
        </div>
        <button className="clay-button px-5 py-3 shadow-sm rounded-xl text-ocean-800 hover:text-ocean-900 font-bold">
          <Settings size={20} />
          <span>System Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Alerts Management Section */}
        <div className="clay-card p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 px-1">
             <h3 className="text-xl font-extrabold text-ocean-900">Action Required</h3>
             <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs shadow-inner">
               {alerts.length} Pending
             </span>
          </div>
          
          <div className="flex flex-col gap-5 flex-1">
            {alerts.map((alert) => (
              <div key={alert.id} className="clay-inset p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-[inset_3px_3px_6px_#b6cedd,inset_-3px_-3px_6px_#ffffff] transition-shadow">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    <RiskBadge status={alert.severity} />
                  </div>
                  <div>
                    <p className="font-bold text-ocean-900 leading-tight">{alert.message}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wide">Reported: {alert.date}</p>
                  </div>
                </div>
                <button className="clay-button bg-ocean-500 text-white hover:bg-ocean-600 hover:text-white px-5 py-2 text-sm rounded-xl font-bold border-none h-auto flex-shrink-0">
                   Resolve
                </button>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="p-8 text-center text-slate-500 font-medium italic clay-inset rounded-2xl flex-1 flex items-center justify-center">
                No pending alerts
              </div>
            )}
          </div>
        </div>

        {/* Global Catch Limits Section */}
        <div className="clay-card p-8 flex flex-col h-full">
          <h3 className="text-xl font-extrabold text-ocean-900 mb-6 px-1">Active Regulations</h3>
          <div className="flex flex-col gap-4 flex-1">
            {limits.map((rule) => (
              <div key={rule.id} className="clay-inset p-5 rounded-2xl flex justify-between items-center group hover:bg-ocean-100/30 transition-colors">
                <div>
                  <h4 className="font-extrabold text-ocean-900 text-lg leading-tight">{rule.limit}</h4>
                  <p className="text-sm font-semibold text-ocean-700/70 mt-1">{rule.scope}</p>
                </div>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 clay-button p-0 flex justify-center items-center rounded-xl bg-white/60" aria-label="Edit">
                    <Edit2 size={18} className="text-ocean-600" />
                  </button>
                  <button className="w-10 h-10 clay-button p-0 flex justify-center items-center rounded-xl bg-green-500/10 border-green-200" aria-label="Confirm">
                    <CheckCircle size={18} className="text-green-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="clay-button w-full mt-6 py-4 rounded-2xl border-dashed border-2 border-ocean-300 bg-ocean-50/50 shadow-[4px_4px_8px_#b6cedd,-4px_-4px_8px_#ffffff] text-ocean-700 font-bold hover:bg-ocean-100/50 hover:text-ocean-800 transition-all">
            + New Regulation
          </button>
        </div>
      </div>
    </div>
  );
};
