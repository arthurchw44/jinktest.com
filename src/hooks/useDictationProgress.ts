// src/hooks/useDictationProgress.ts

import { useState, useEffect, useCallback } from 'react';
import type { DictationSession } from '../components/dictation/FragmentDictation';

interface StoredSession {
  session: DictationSession;
  lastUpdated: string;
  isCompleted: boolean;
}

const STORAGE_KEY_PREFIX = 'dictation_session_';
const MAX_STORED_SESSIONS = 10;

export function useDictationProgress(articleName: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${articleName}`;
  
  const [savedSession, setSavedSession] = useState<DictationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedSession: StoredSession = JSON.parse(stored);
        // Convert date strings back to Date objects
        const session = {
          ...parsedSession.session,
          startTime: new Date(parsedSession.session.startTime),
          progress: parsedSession.session.progress.map(p => ({
            ...p,
            attempts: p.attempts.map(a => ({
              ...a,
              timestamp: new Date(a.timestamp)
            }))
          }))
        };
        setSavedSession(session);
      }
    } catch (error) {
      console.error('Failed to load saved dictation session:', error);
      localStorage.removeItem(storageKey);
    }
    setIsLoading(false);
  }, [storageKey]);

  // Save session to localStorage
  const saveSession = useCallback((session: DictationSession) => {
    try {
      const storedSession: StoredSession = {
        session,
        lastUpdated: new Date().toISOString(),
        isCompleted: session.completedFragments === session.fragments.length
      };
      
      localStorage.setItem(storageKey, JSON.stringify(storedSession));
      setSavedSession(session);
    } catch (error) {
      console.error('Failed to save dictation session:', error);
    }
  }, [storageKey]);

  // Clear saved session
  const clearSession = useCallback(() => {
    localStorage.removeItem(storageKey);
    setSavedSession(null);
  }, [storageKey]);

  // Get all stored sessions (for dashboard)
  const getAllSessions = useCallback((): StoredSession[] => {
    const sessions: StoredSession[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            sessions.push(JSON.parse(stored));
          }
        } catch (error) {
          console.error('Failed to parse stored session:', error);
          localStorage.removeItem(key);
        }
      }
    }

    return sessions.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }, []);

  // Clean old sessions (keep only recent ones)
  const cleanOldSessions = useCallback(() => {
    const allSessions = getAllSessions();
    if (allSessions.length > MAX_STORED_SESSIONS) {
      const toRemove = allSessions.slice(MAX_STORED_SESSIONS);
      toRemove.forEach(session => {
        const key = `${STORAGE_KEY_PREFIX}${session.session.articleName}`;
        localStorage.removeItem(key);
      });
    }
  }, [getAllSessions]);

  return {
    savedSession,
    isLoading,
    saveSession,
    clearSession,
    getAllSessions,
    cleanOldSessions
  };
}