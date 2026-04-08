import React from 'react';
import { FishSpecies, FishPopulation } from '../types';
import { RiskBadge } from './RiskBadge';
import { formatStockPercentage } from '../utils/formatters';

interface SpeciesCardProps {
  species: FishSpecies;
  population: FishPopulation;
}

export const SpeciesCard: React.FC<SpeciesCardProps> = ({ species, population }) => {
  return (
    <div className="clay-card p-6 flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold text-ocean-900 leading-tight">{species.common_name}</h3>
          <p className="text-sm italic text-slate-500 mt-0.5">{species.scientific_name}</p>
        </div>
        <RiskBadge status={population.risk_status} />
      </div>

      {/* Stats Area (Inside an inset clay container) */}
      <div className="clay-inset p-4 mt-2 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-ocean-700/80 font-medium tracking-wide">Current Stock</span>
          <span className="font-bold text-ocean-900">
            {population.current_stock.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center relative">
          <span className="text-sm text-ocean-700/80 font-medium tracking-wide">Health Level</span>
          <span className="font-bold text-ocean-900">
            {formatStockPercentage(population.stock_percentage)}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-200/50 rounded-full h-3 mt-1 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
              population.stock_percentage && population.stock_percentage < 30 ? 'bg-gradient-to-r from-red-400 to-red-500' :
              population.stock_percentage && population.stock_percentage < 60 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' : 
              'bg-gradient-to-r from-ocean-400 to-ocean-500'
            }`}
             style={{ width: `${Math.min(100, Math.max(0, population.stock_percentage || 0))}%` }}
          ></div>
        </div>
      </div>
      
      {/* Footer Details */}
      {(species.min_catch_size_cm || species.daily_catch_limit) && (
        <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
          {species.min_catch_size_cm && (
             <span>Min Size: <strong className="text-ocean-700">{species.min_catch_size_cm}cm</strong></span>
          )}
          {species.daily_catch_limit && (
             <span>Daily Limit: <strong className="text-ocean-700">{species.daily_catch_limit} units</strong></span>
          )}
        </div>
      )}
    </div>
  );
};
