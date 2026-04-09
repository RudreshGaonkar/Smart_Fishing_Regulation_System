import React from 'react';
import { BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';

interface ChartWidgetProps {
  title: string;
  data?: Record<string, any>[];
  type?: 'bar' | 'line';
  dataKeys?: string[];
  xKey?: string;
}

const COLORS = ['#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444'];

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  data,
  type = 'bar',
  dataKeys = ['value'],
  xKey = 'name',
}) => {
  const hasData = data && data.length > 0;

  return (
    <div className="clay-card p-6 flex flex-col h-full min-h-[350px]">
      <h3 className="text-xl font-extrabold text-ocean-900 mb-4 tracking-tight px-1">{title}</h3>

      <div className="clay-inset flex-1 rounded-2xl p-4 relative overflow-hidden bg-gradient-to-br from-ocean-50/30 to-ocean-200/20">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
            {type === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend />
                {dataKeys.map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} />
                ))}
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend />
                {dataKeys.map((key, i) => (
                  <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          // Placeholder when no data
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)',
              backgroundSize: '2rem 2rem',
            }} />
            <div className="flex flex-col items-center gap-4 z-10">
              <div className="p-4 bg-white/40 rounded-full shadow-sm text-ocean-600 animate-pulse">
                <BarChart3 size={32} />
              </div>
              <p className="text-lg font-bold text-ocean-800 text-center uppercase tracking-wider">
                No Data Available
              </p>
              <p className="text-sm text-ocean-700/60 text-center max-w-[250px]">
                Data will appear here once the backend returns records.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
