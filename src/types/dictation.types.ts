// src/types/dictation.types.ts
import type { ComparisonResult } from '../types/article.types'
import type { FragmentTiming } from '../hooks/useFragmentAudioPlayer'

export interface DictationAttempt {
  attempt: string
  result: ComparisonResult
  timestamp: Date
}

export type FragmentStatus = 'pending' | 'correct' | 'givenup'

export interface FragmentProgress {
  fragmentIndex: number
  attempts: DictationAttempt[]
  status: FragmentStatus
  bestScore: number
  timeSpent: number // seconds
}

export interface DictationSession {
  articleName: string
  articleTitle: string
  fragments: FragmentTiming[]
  progress: FragmentProgress[]
  currentFragmentIndex: number
  startTime: Date
  endTime?: Date
  completedFragments: number
  totalScore: number
  isCompleted: boolean
}
