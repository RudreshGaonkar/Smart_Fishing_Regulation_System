import { useState, useEffect, useCallback } from 'react';
// import { api } from '../services/api';
import { FishPopulation, FishSpecies } from '../types';

export interface PopulationDataPair {
  species: FishSpecies;
  population: FishPopulation;
}

export const usePopulationData = (zoneId?: number) => {
  const [data, setData] = useState<PopulationDataPair[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopulationData = useCallback(async (targetZoneId?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app we'd fetch this via the api instance
      // const response = await api.get(`/population${targetZoneId ? `?zoneId=${targetZoneId}` : ''}`);
      // setData(response.data);
      
      // Mocking response for frontend scaffolding setup
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockData: PopulationDataPair[] = [
        {
          species: {
             species_id: 1, common_name: 'Atlantic Cod', scientific_name: 'Gadus morhua', 
             description: 'A popular food fish.', is_protected: false, risk_level: 2, 
             min_catch_size_cm: 35, daily_catch_limit: 5, season_start: null, season_end: null, 
             created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          },
          population: {
             population_id: 1, zone_id: targetZoneId || 1, species_id: 1, current_stock: 45000, 
             estimated_total: 100000, stock_percentage: 45.0, risk_status: 'warning', 
             last_surveyed: new Date().toISOString(), updated_at: new Date().toISOString()
          }
        },
        {
          species: {
             species_id: 2, common_name: 'Bluefin Tuna', scientific_name: 'Thunnus thynnus', 
             description: 'Highly prized, highly protected.', is_protected: true, risk_level: 5, 
             min_catch_size_cm: 115, daily_catch_limit: 1, season_start: '2026-06-01', season_end: '2026-11-01', 
             created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          },
          population: {
             population_id: 2, zone_id: targetZoneId || 1, species_id: 2, current_stock: 1200, 
             estimated_total: 15000, stock_percentage: 8.0, risk_status: 'critical', 
             last_surveyed: new Date().toISOString(), updated_at: new Date().toISOString()
          }
        }
      ];
      
      setData(mockData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch population data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Automatically fetch if we have a zoneId right on mount
  useEffect(() => {
    fetchPopulationData(zoneId);
  }, [zoneId, fetchPopulationData]);

  return {
    data,
    isLoading,
    error,
    refreshMap: () => fetchPopulationData(zoneId)
  };
};
