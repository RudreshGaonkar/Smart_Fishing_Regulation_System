import React, { useState } from 'react';
import { Target, Activity } from 'lucide-react';

type EffortLevel = 'low' | 'medium' | 'high';

interface CatchFormProps {
  onSubmit: (zoneId: number, effortLevel: EffortLevel) => void;
  isLoading?: boolean;
}

export const CatchForm: React.FC<CatchFormProps> = ({ onSubmit, isLoading }) => {
  const [zoneId, setZoneId] = useState<number>(1);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('medium');

  // Hardcoded mockup zones for now
  const availableZones = [
    { id: 1, name: 'Zone Alpha (Coastal)' },
    { id: 2, name: 'Zone Beta (Deep Sea)' },
    { id: 3, name: 'Zone Gamma (Protected Nearshore)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(zoneId, effortLevel);
  };

  return (
    <div className="clay-card p-8 w-full max-w-md">
      <h3 className="text-2xl font-extrabold text-ocean-900 mb-6 flex items-center gap-3">
        <Target size={24} className="text-ocean-600" />
        Log Fishing Session
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Zone Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-ocean-800 ml-2 uppercase tracking-wide">Target Zone</label>
          <div className="clay-inset rounded-2xl relative">
            <select
              value={zoneId}
              onChange={(e) => setZoneId(Number(e.target.value))}
              className="w-full h-14 bg-transparent border-none outline-none px-4 text-slate-700 font-medium appearance-none z-10 relative cursor-pointer"
              disabled={isLoading}
            >
              {availableZones.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
            {/* Custom arrow mimicking claymorphism depth */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-ocean-500">
               ▼
            </div>
          </div>
        </div>

        {/* Effort Level Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-ocean-800 ml-2 uppercase tracking-wide flex items-center gap-2">
             <Activity size={16} /> 
             Effort Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['low', 'medium', 'high'] as EffortLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEffortLevel(level)}
                disabled={isLoading}
                className={`h-12 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                  effortLevel === level 
                    ? 'clay-inset bg-ocean-100 text-ocean-700 ring-2 ring-ocean-400 border-none' 
                    : 'clay-button bg-ocean-50/50 text-slate-500 hover:text-ocean-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="clay-button h-14 mt-4 text-lg bg-gradient-to-br from-ocean-400 to-ocean-500 text-white border-ocean-300 shadow-[6px_6px_12px_#b6cedd,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#b6cedd,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_rgba(3,105,161,0.5),inset_-4px_-4px_8px_rgba(56,189,248,0.5)] disabled:opacity-70"
        >
          {isLoading ? 'Processing...' : 'Start Session'}
        </button>
      </form>
    </div>
  );
};
