import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, XCircle } from 'lucide-react';
import { RiskStatus } from '../types';

interface RiskBadgeProps {
  status: RiskStatus;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ status }) => {
  // Define styles and icons based on the risk status
  const getBadgeStyles = () => {
    switch (status) {
      case 'safe':
        return {
          bg: 'bg-green-100 text-green-700 border-green-200',
          icon: <ShieldCheck size={14} />,
          label: 'Safe'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: <AlertTriangle size={14} />,
          label: 'Warning'
        };
      case 'critical':
        return {
          bg: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: <AlertOctagon size={14} />,
          label: 'Critical'
        };
      case 'depleted':
        return {
          bg: 'bg-red-100 text-red-700 border-red-200',
          icon: <XCircle size={14} />,
          label: 'Depleted'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <ShieldCheck size={14} />,
          label: 'Unknown'
        };
    }
  };

  const { bg, icon, label } = getBadgeStyles();

  return (
    <div 
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bg} 
      shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05),inset_-1px_-1px_3px_rgba(255,255,255,0.8)] border`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};
