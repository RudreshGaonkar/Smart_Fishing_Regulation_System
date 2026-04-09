import React, { useState, useEffect } from 'react';
import { ChartWidget } from '../components/ChartWidget';
import { FileText, Download, Loader2 } from 'lucide-react';
import { fetchPopulationTrends, fetchCatchHistory } from '../services/dataService';
import type { PopulationTrend, CatchRecord } from '../services/dataService';

export const ResearchReports: React.FC = () => {
  const [trends, setTrends] = useState<PopulationTrend[]>([]);
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPopulationTrends(), fetchCatchHistory()])
      .then(([t, c]) => { setTrends(t); setCatches(c); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Shape data for ChartWidget
  const populationChartData = trends.map((t) => ({
    name: `${t.species_name} (${t.zone_name})`,
    stock_percentage: Number(t.stock_percentage ?? 0),
  }));

  const catchChartData = Object.values(
    catches.reduce((acc: Record<string, { name: string; total: number }>, c) => {
      const key = c.common_name || `Species ${c.species_id}`;
      if (!acc[key]) acc[key] = { name: key, total: 0 };
      acc[key].total += c.quantity;
      return acc;
    }, {})
  );

  const limitVsActual = trends.map((t) => ({
    name: t.species_name,
    stock: Number(t.stock_percentage ?? 0),
    risk: t.risk_status === 'critical' ? 20 : t.risk_status === 'warning' ? 50 : 80,
  }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1 mb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Research Reports</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time analytics drawn from live database records.</p>
        </div>
        <button className="clay-button px-5 py-3 shadow-sm rounded-xl text-ocean-800 font-bold flex items-center gap-2">
          <Download size={18} /><span>Export All Data</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-ocean-500 gap-3">
          <Loader2 size={24} className="animate-spin" />
          <span className="font-semibold">Loading analytics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartWidget
            title="Population Trends by Species & Zone"
            data={populationChartData}
            type="bar"
            dataKeys={['stock_percentage']}
            xKey="name"
          />
          <ChartWidget
            title="Catch Volume by Species"
            data={catchChartData}
            type="bar"
            dataKeys={['total']}
            xKey="name"
          />
          <ChartWidget
            title="Stock Health vs Safety Threshold"
            data={limitVsActual}
            type="line"
            dataKeys={['stock', 'risk']}
            xKey="name"
          />
          <ChartWidget
            title="Risk Status Distribution"
            data={trends.reduce((acc: { name: string; count: number }[], t) => {
              const existing = acc.find((a) => a.name === t.risk_status);
              if (existing) existing.count++;
              else acc.push({ name: t.risk_status, count: 1 });
              return acc;
            }, [])}
            type="bar"
            dataKeys={['count']}
            xKey="name"
          />
        </div>
      )}

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
