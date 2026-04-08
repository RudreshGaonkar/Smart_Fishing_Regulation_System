import React from 'react';
import { ChartWidget } from '../components/ChartWidget';
import { FileText, Download } from 'lucide-react';

export const ResearchReports: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1 mb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Research Reports</h2>
          <p className="text-slate-500 font-medium mt-1">Exportable aggregate data analysis and ecosystem health trends.</p>
        </div>
        <button className="clay-button px-5 py-3 shadow-sm rounded-xl text-ocean-800 font-bold flex items-center gap-2">
          <Download size={18} />
          <span>Export All Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         <ChartWidget title="Population Trends Over Time" />
         <ChartWidget title="Catch Limits vs Actual Catches" />
         <ChartWidget title="Vessel Deployment Distribution" />
         <ChartWidget title="Risk Alert Frequency by Zone" />
      </div>

      <div className="clay-card p-8 mt-4 flex justify-between items-center bg-gradient-to-br from-ocean-50 to-ocean-100">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full clay-inset flex justify-center items-center text-ocean-600 bg-white/60">
               <FileText size={24} />
            </div>
            <div>
               <h4 className="font-extrabold text-ocean-900 text-lg">Generate Custom Report</h4>
               <p className="text-sm text-slate-600 font-medium">Select specific zones, species, and timeframes for deep analysis.</p>
            </div>
         </div>
         <button className="clay-button px-6 py-3 font-bold bg-ocean-500 text-white hover:text-white hover:bg-ocean-600 shadow-[4px_4px_8px_#b6cedd,-4px_-4px_8px_#ffffff] border-none">
            Generator Tool →
         </button>
      </div>
    </div>
  );
};
