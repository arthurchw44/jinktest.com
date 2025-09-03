// Enhanced Server-Local Synchronization Hook
// src/hooks/useServerDictationProgress.ts

import { useState, useCallback } from 'react'
import { useSessionUpload } from './useSessionUpload'
import type { DictationSession } from '../types/dictation.types'

interface SyncStatus {
  isUploading: boolean
  lastSyncAttempt: Date | null
  failedAttempts: number
  error: string | null
  hasPendingSync: boolean
}

interface StoredSessionData {
  session: {
    articleName: string
    articleTitle: string
    startTime: string // ISO string
    endTime?: string | null
    fragments: any[]
    progress: any[]
    currentFragmentIndex: number
    completedFragments: number
    totalScore: number
    isCompleted: boolean
  }
  lastUpdated: string
  isCompleted: boolean
  syncStatus: 'synced' | 'pending' | 'failed'
  lastSyncError?: string
  syncAttempts: number
}

export const useServerDictationProgress = (articleName: string) => {
  const uploadMutation = useSessionUpload()
  const storageKey = `dictation-session-${articleName}`
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isUploading: false,
    lastSyncAttempt: null,
    failedAttempts: 0,
    error: null,
    hasPendingSync: false
  })

  // Check if there are pending syncs on hook initialization
  const checkPendingSync = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data: StoredSessionData = JSON.parse(stored)
        setSyncStatus(prev => ({
          ...prev,
          hasPendingSync: data.syncStatus === 'failed' || data.syncStatus === 'pending',
          error: data.syncStatus === 'failed' ? data.lastSyncError || 'Previous sync failed' : null,
          failedAttempts: data.syncAttempts || 0
        }))
      }
    } catch (error) {
      console.error('Failed to check pending sync status:', error)
    }
  }, [storageKey])

  const saveSession = useCallback(async (session: DictationSession) => {
    // Prepare backup data with proper serialization
    const backupData: StoredSessionData = {
      session: {
        articleName: session.articleName,
        articleTitle: session.articleTitle,
        // Ensure proper date serialization
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString() || null,
        fragments: session.fragments,
        progress: session.progress,
        currentFragmentIndex: session.currentFragmentIndex,
        completedFragments: session.completedFragments,
        totalScore: session.totalScore,
        isCompleted: session.isCompleted
      },
      lastUpdated: new Date().toISOString(),
      isCompleted: session.isCompleted || session.completedFragments === session.fragments.length,
      syncStatus: 'pending',
      syncAttempts: 0
    }

    // Always save to localStorage first as backup
    try {
      localStorage.setItem(storageKey, JSON.stringify(backupData))
      console.log('Session saved to localStorage as backup')
    } catch (localError) {
      console.error('Failed to save to localStorage:', localError)
      // Continue with server sync attempt even if localStorage fails
    }

    // Update sync status to show upload in progress
    setSyncStatus(prev => ({
      ...prev,
      isUploading: true,
      error: null,
      hasPendingSync: true
    }))

    try {
      // Attempt server sync
      await uploadMutation.mutateAsync(session)
      
      // Success: Update localStorage to mark as synced
      const syncedData: StoredSessionData = {
        ...backupData,
        syncStatus: 'synced',
        syncAttempts: 0,
        lastSyncError: undefined
      }
      
      localStorage.setItem(storageKey, JSON.stringify(syncedData))
      
      setSyncStatus(prev => ({
        ...prev,
        isUploading: false,
        lastSyncAttempt: new Date(),
        failedAttempts: 0,
        error: null,
        hasPendingSync: false
      }))
      
      console.log('Session successfully synced to server')
      
    } catch (error: any) {
      console.error('Failed to upload session to server:', error)
      
      // Update localStorage to mark sync as failed but preserve data
      const failedData: StoredSessionData = {
        ...backupData,
        syncStatus: 'failed',
        lastSyncError: error.message || 'Upload failed',
        syncAttempts: (backupData.syncAttempts || 0) + 1
      }
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(failedData))
      } catch (localError) {
        console.error('Failed to update localStorage after sync failure:', localError)
      }
      
      setSyncStatus(prev => ({
        ...prev,
        isUploading: false,
        lastSyncAttempt: new Date(),
        failedAttempts: prev.failedAttempts + 1,
        error: error.message || 'Upload failed',
        hasPendingSync: true
      }))
    }
  }, [articleName, uploadMutation, storageKey])

  // Manual retry for failed syncs
  const retrySyncFailed = useCallback(async (): Promise<boolean> => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) {
        console.warn('No stored session found for retry')
        return false
      }

      const data: StoredSessionData = JSON.parse(stored)
      if (data.syncStatus !== 'failed') {
        console.warn('No failed sync to retry')
        return false
      }

      // Reconstruct session from stored data
      const session: DictationSession = {
        articleName: data.session.articleName,
        articleTitle: data.session.articleTitle,
        startTime: new Date(data.session.startTime),
        endTime: data.session.endTime ? new Date(data.session.endTime) : undefined,
        fragments: data.session.fragments,
        progress: data.session.progress,
        currentFragmentIndex: data.session.currentFragmentIndex,
        completedFragments: data.session.completedFragments,
        totalScore: data.session.totalScore,
        isCompleted: data.session.isCompleted
      }

      // Attempt sync again
      await saveSession(session)
      return true

    } catch (error) {
      console.error('Failed to retry sync:', error)
      return false
    }
  }, [storageKey, saveSession])

  // Get sync status information
  const getSyncInfo = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data: StoredSessionData = JSON.parse(stored)
        return {
          hasLocalData: true,
          syncStatus: data.syncStatus,
          lastUpdated: new Date(data.lastUpdated),
          syncAttempts: data.syncAttempts || 0,
          lastSyncError: data.lastSyncError
        }
      }
      return {
        hasLocalData: false,
        syncStatus: null,
        lastUpdated: null,
        syncAttempts: 0,
        lastSyncError: null
      }
    } catch (error) {
      console.error('Failed to get sync info:', error)
      return {
        hasLocalData: false,
        syncStatus: null,
        lastUpdated: null,
        syncAttempts: 0,
        lastSyncError: null
      }
    }
  }, [storageKey])

  // Clear failed sync data
  const clearFailedSync = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
      setSyncStatus(prev => ({
        ...prev,
        error: null,
        failedAttempts: 0,
        hasPendingSync: false
      }))
      console.log('Cleared failed sync data')
    } catch (error) {
      console.error('Failed to clear failed sync data:', error)
    }
  }, [storageKey])

  return {
    saveSession,
    syncStatus,
    retrySyncFailed,
    getSyncInfo,
    clearFailedSync,
    checkPendingSync
  }
}

// Enhanced localStorage-only hook with better error handling
export function useDictationProgress(articleName: string) {
  const storageKey = `dictation-session-${articleName}`
  const [savedSession, setSavedSession] = useState<DictationSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Enhanced session loading with comprehensive error recovery
  const loadSavedSession = useCallback(async () => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) {
        setSavedSession(null)
        setIsLoading(false)
        return
      }

      const parsedData: StoredSessionData = JSON.parse(stored)
      
      // Validate stored data structure
      if (!parsedData.session || !parsedData.lastUpdated) {
        console.warn('Invalid stored session data structure, clearing...')
        localStorage.removeItem(storageKey)
        setSavedSession(null)
        setIsLoading(false)
        return
      }

      // Convert date strings back to Date objects with error handling
      const session: DictationSession = {
        articleName: parsedData.session.articleName,
        articleTitle: parsedData.session.articleTitle,
        startTime: new Date(parsedData.session.startTime),
        endTime: parsedData.session.endTime ? new Date(parsedData.session.endTime) : undefined,
        fragments: parsedData.session.fragments || [],
        progress: (parsedData.session.progress || []).map((p: any) => ({
          ...p,
          attempts: (p.attempts || []).map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp)
          }))
        })),
        currentFragmentIndex: parsedData.session.currentFragmentIndex || 0,
        completedFragments: parsedData.session.completedFragments || 0,
        totalScore: parsedData.session.totalScore || 0,
        isCompleted: parsedData.session.isCompleted || false
      }

      // Basic session integrity checks
      if (!session.articleName || !session.progress) {
        console.warn('Session data integrity check failed, clearing...')
        localStorage.removeItem(storageKey)
        setSavedSession(null)
      } else if (session.progress.length === 0) {
        console.warn('Empty progress array found, clearing session...')
        localStorage.removeItem(storageKey)
        setSavedSession(null)
      } else {
        setSavedSession(session)
        console.log(`Loaded saved session with ${session.progress.length} fragments, current index: ${session.currentFragmentIndex}`)
      }

    } catch (error: any) {
      console.error('Failed to load saved dictation session:', error)
      setLoadError(`Failed to load saved progress: ${error.message}`)
      
      // Clear corrupted data
      try {
        localStorage.removeItem(storageKey)
        console.log('Cleared corrupted session data')
      } catch (clearError) {
        console.error('Failed to clear corrupted session data:', clearError)
      }
      
      setSavedSession(null)
    } finally {
      setIsLoading(false)
    }
  }, [storageKey])

  // Load session on hook initialization
  useState(() => {
    loadSavedSession()
  })

  return {
    savedSession,
    isLoading,
    loadError,
    // Expose method to clear corrupted sessions
    clearSession: useCallback(() => {
      try {
        localStorage.removeItem(storageKey)
        setSavedSession(null)
        setLoadError(null)
        console.log('Session cleared by user')
      } catch (error) {
        console.error('Failed to clear session:', error)
      }
    }, [storageKey]),
    // Expose method to reload session
    reloadSession: loadSavedSession
  }
}