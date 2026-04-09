import { useState, useCallback } from 'react';
import { startSession as apiStartSession, logCatch as apiLogCatch } from '../services/dataService';
import type { StartSessionPayload, LogCatchPayload } from '../services/dataService';

interface FishingSessionState {
  sessionId: number | null;
  zoneId: number | null;
  effortLevel: 'low' | 'medium' | 'high';
  departurePort: string | null;
  status: 'inactive' | 'active' | 'completed';
  isLoading: boolean;
  error: string | null;
  lastCatchResult: { is_within_limit: boolean; message: string } | null;
}

export const useFishingSession = () => {
  const [session, setSession] = useState<FishingSessionState>({
    sessionId: null,
    zoneId: null,
    effortLevel: 'medium',
    departurePort: null,
    status: 'inactive',
    isLoading: false,
    error: null,
    lastCatchResult: null,
  });

  const startSession = useCallback(async (payload: StartSessionPayload) => {
    setSession((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await apiStartSession(payload);
      setSession((prev) => ({
        ...prev,
        sessionId: result.session_id,
        zoneId: result.zone_id,
        effortLevel: payload.effort_level,
        departurePort: payload.departure_port ?? null,
        status: 'active',
        isLoading: false,
      }));
    } catch (err: any) {
      setSession((prev) => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.error || 'Failed to start session',
      }));
    }
  }, []);

  const logCatch = useCallback(async (payload: LogCatchPayload) => {
    if (!session.sessionId) return;
    setSession((prev) => ({ ...prev, isLoading: true, error: null, lastCatchResult: null }));
    try {
      const result = await apiLogCatch(session.sessionId, payload);
      setSession((prev) => ({ ...prev, isLoading: false, lastCatchResult: result }));
    } catch (err: any) {
      setSession((prev) => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.error || 'Failed to log catch',
      }));
    }
  }, [session.sessionId]);

  const endSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: 'completed', sessionId: null }));
  }, []);

  return {
    session,
    startSession,
    logCatch,
    endSession,
    isActive: session.status === 'active',
  };
};
