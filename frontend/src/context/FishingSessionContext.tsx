import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchMyActiveSession,
  startSession as apiStartSession,
  type MyActiveSession,
  type StartSessionPayload,
} from '../services/dataService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface FishingSessionContextType {
  /** The currently active session, or null if none exists. */
  activeSession: MyActiveSession | null;
  /** True while the context is fetching the initial session on mount. */
  isInitializing: boolean;
  /** True while a startSession API call is in-flight. */
  isStarting: boolean;
  /** Last API error from startSession, if any. */
  startError: string | null;
  /** Whether there is an active session right now. */
  isSessionActive: boolean;
  /** Call this from FishingSimulation to start a new session. */
  startSession: (payload: StartSessionPayload) => Promise<void>;
  /** Call this when the fisherman ends their session (optimistic clear). */
  clearSession: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const FishingSessionContext = createContext<FishingSessionContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────

export const FishingSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<MyActiveSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // On mount: rehydrate session from backend (handles page reloads gracefully)
  useEffect(() => {
    let alive = true;
    const token = localStorage.getItem('token');

    // Skip fetch if user is not logged in yet
    if (!token) {
      setIsInitializing(false);
      return;
    }

    fetchMyActiveSession()
      .then((session) => {
        if (alive) setActiveSession(session);
      })
      .catch(() => {
        // Non-critical: simply treat as no active session
        if (alive) setActiveSession(null);
      })
      .finally(() => {
        if (alive) setIsInitializing(false);
      });

    return () => { alive = false; };
  }, []);

  const startSession = useCallback(async (payload: StartSessionPayload) => {
    setIsStarting(true);
    setStartError(null);
    try {
      const result = await apiStartSession(payload);
      // Build the full MyActiveSession shape from the API response + payload
      const newSession: MyActiveSession = {
        session_id: result.session_id,
        user_id: 0,                          // will be re-fetched on next mount if needed
        zone_id: result.zone_id,
        zone_name: '',                        // backend doesn't return this on POST; fetch fills it
        departure_port: result.departure_port ?? null,
        effort_level: payload.effort_level,
        status: 'active',
        started_at: new Date().toISOString(),
      };

      // Immediately hydrate from backend to get zone_name from the JOIN
      const hydrated = await fetchMyActiveSession();
      setActiveSession(hydrated ?? newSession);
    } catch (err: any) {
      setStartError(err.response?.data?.error || 'Failed to start session. Please try again.');
    } finally {
      setIsStarting(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setActiveSession(null);
    setStartError(null);
  }, []);

  const value: FishingSessionContextType = {
    activeSession,
    isInitializing,
    isStarting,
    startError,
    isSessionActive: activeSession !== null,
    startSession,
    clearSession,
  };

  return (
    <FishingSessionContext.Provider value={value}>
      {children}
    </FishingSessionContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────

export const useFishingSessionContext = (): FishingSessionContextType => {
  const context = useContext(FishingSessionContext);
  if (context === undefined) {
    throw new Error('useFishingSessionContext must be used within a FishingSessionProvider');
  }
  return context;
};
