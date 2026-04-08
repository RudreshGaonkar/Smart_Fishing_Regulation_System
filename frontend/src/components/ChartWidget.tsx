import React from 'react';
import { BarChart3 } from 'lucide-react';

interface ChartWidgetProps {
  title: string;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ title }) => {
  return (
    <div className="clay-card p-6 flex flex-col h-full min-h-[350px]">
      <h3 className="text-xl font-extrabold text-ocean-900 mb-4 tracking-tight px-1">{title}</h3>
      
      {/* Chart visualization area wrapper */}
      <div className="clay-inset flex-1 rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-ocean-50/30 to-ocean-200/20">
        
        {/* Soft grid background representing a chart area */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
           backgroundImage: 'linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)',
           backgroundSize: '2rem 2rem'
        }}></div>

        <div className="flex flex-col items-center gap-4 z-10">
          <div className="p-4 bg-white/40 rounded-full shadow-sm text-ocean-600 animate-pulse">
            <BarChart3 size={32} />
          </div>
          <p className="text-lg font-bold text-ocean-800 text-center uppercase tracking-wider">
            Chart Visualization Loading...
          </p>
          <p className="text-sm text-ocean-700/60 text-center max-w-[250px]">
            This 3D clay container will be wired to Chart.js or D3 in future updates.
          </p>
        </div>
      </div>
    </div>
  );
};
