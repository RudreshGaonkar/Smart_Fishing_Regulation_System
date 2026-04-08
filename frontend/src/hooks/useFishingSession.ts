import { useState, useCallback } from 'react';

type EffortLevel = 'low' | 'medium' | 'high';

interface FishingSessionState {
  sessionId: number | null;
  zoneId: number | null;
  effortLevel: EffortLevel;
  status: 'inactive' | 'active' | 'completed' | 'cancelled';
  expectedCatchCalculating: boolean;
}

export const useFishingSession = () => {
  const [session, setSession] = useState<FishingSessionState>({
    sessionId: null,
    zoneId: null,
    effortLevel: 'medium',
    status: 'inactive',
    expectedCatchCalculating: false,
  });

  const startSession = useCallback(async (zoneId: number, effortLevel: EffortLevel = 'medium') => {
    // Attempting to simulate an API call
    setSession((prev) => ({ ...prev, status: 'inactive', expectedCatchCalculating: true }));
    
    try {
      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setSession({
        sessionId: Math.floor(Math.random() * 1000) + 1,
        zoneId,
        effortLevel,
        status: 'active',
        expectedCatchCalculating: false,
      });
    } catch (error) {
      setSession((prev) => ({ ...prev, expectedCatchCalculating: false }));
      console.error("Failed to start session", error);
    }
  }, []);

  const endSession = useCallback(async () => {
    try {
      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSession((prev) => ({ ...prev, status: 'completed' }));
    } catch (error) {
      console.error("Failed to end session", error);
    }
  }, []);

  const updateEffortLevel = useCallback((level: EffortLevel) => {
    setSession((prev) => ({ ...prev, effortLevel: level }));
  }, []);

  return {
    session,
    startSession,
    endSession,
    updateEffortLevel,
    isActive: session.status === 'active'
  };
};
