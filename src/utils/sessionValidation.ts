// Enhanced Session Validation and Restoration Utilities
// src/utils/sessionValidation.ts

import type { DictationSession } from '../types/dictation.types'
import type { FragmentTiming } from '../types/article.types'


export interface SessionValidationResult {
  isValid: boolean
  canRestore: boolean
  requiresMigration: boolean
  issues: string[]
}

export function validateSavedSession(
  savedSession: DictationSession | null|undefined, 
  currentFragments: FragmentTiming[]
): SessionValidationResult {
  if (!savedSession) {
    return {
      isValid: false,
      canRestore: false, 
      requiresMigration: false,
      issues: ['No saved session']
    }
  }

  const issues: string[] = []
  
  // Basic session data validation
  if (!savedSession.articleName || !savedSession.progress) {
    issues.push('Invalid session data structure')
  }

  // Check fragment count alignment
  if (savedSession.fragments.length !== currentFragments.length) {
    issues.push(`Fragment count mismatch: saved=${savedSession.fragments.length}, current=${currentFragments.length}`)
  }

  // Validate fragment content integrity using text comparison
  const contentMismatches = currentFragments.filter((current, idx) => {
    const saved = savedSession.fragments[idx]
    return saved && saved.text !== current.text
  })
  
  if (contentMismatches.length > 0) {
    issues.push(`Fragment content changed: ${contentMismatches.length} fragments differ`)
  }

  // Check progress array integrity
  if (!savedSession.progress || savedSession.progress.length !== currentFragments.length) {
    issues.push('Progress array length mismatch')
  }

  // Validate currentFragmentIndex bounds
  if (savedSession.currentFragmentIndex < 0 || savedSession.currentFragmentIndex >= currentFragments.length) {
    issues.push(`Current fragment index out of bounds: ${savedSession.currentFragmentIndex}`)
  }

  // Check for data corruption indicators
  const progressIndexMismatches = savedSession.progress?.filter((p, idx) => p.fragmentIndex !== idx).length || 0
  if (progressIndexMismatches > 0) {
    issues.push(`Progress index mismatches: ${progressIndexMismatches} entries`)
  }

  // Determine restoration capability
  const canRestore = issues.length === 0
  const requiresMigration = !canRestore && issues.length <= 2 && 
    !issues.some(issue => issue.includes('Invalid session data structure'))

  return {
    isValid: Boolean(savedSession.articleName && savedSession.progress),
    canRestore,
    requiresMigration,
    issues
  }
}

export function migrateSession(
  savedSession: DictationSession,
  currentFragments: FragmentTiming[]
): DictationSession {
  // Create progress array for current fragments
  const migratedProgress = currentFragments.map((fragment, idx) => {
    const savedProgress = savedSession.progress?.[idx]
    
    // Only restore progress if fragment text matches exactly
    if (savedProgress && 
        idx < savedSession.fragments.length && 
        savedSession.fragments[idx]?.text === fragment.text) {
      return {
        ...savedProgress,
        fragmentIndex: idx, // Ensure consistent indexing
      }
    }
    
    // Create fresh progress for changed/new fragments
    return {
      fragmentIndex: idx,
      attempts: [],
      status: 'pending' as const,
      bestScore: 0,
      timeSpent: 0,
    }
  })
  
  // Find appropriate resumption point
  const firstPendingIndex = migratedProgress.findIndex(p => p.status === 'pending')
  const resumeIndex = firstPendingIndex >= 0 ? firstPendingIndex : Math.max(0, currentFragments.length - 1)
  
  // Calculate derived values
  const completedFragments = migratedProgress.filter(p => p.status !== 'pending').length
  const totalScore = migratedProgress.reduce((sum, p) => sum + p.bestScore, 0) / Math.max(currentFragments.length, 1)
  
  return {
    articleName: savedSession.articleName,
    articleTitle: savedSession.articleTitle,
    fragments: currentFragments, // Always use current fragments as source of truth
    progress: migratedProgress,
    currentFragmentIndex: Math.min(resumeIndex, currentFragments.length - 1),
    startTime: savedSession.startTime,
    endTime: undefined, // Reset end time for continued sessions
    completedFragments,
    totalScore,
    isCompleted: false, // Reset completion status for migrated sessions
  }
}

export function createFreshSession(
  articleName: string,
  articleTitle: string,
  fragments: FragmentTiming[]
): DictationSession {
  return {
    articleName,
    articleTitle,
    fragments,
    progress: fragments.map((_, index) => ({
      fragmentIndex: index,
      attempts: [],
      status: 'pending' as const,
      bestScore: 0,
      timeSpent: 0,
    })),
    currentFragmentIndex: 0,
    startTime: new Date(),
    endTime: undefined,
    completedFragments: 0,
    totalScore: 0,
    isCompleted: false,
  }
}