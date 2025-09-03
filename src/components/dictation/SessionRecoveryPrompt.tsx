// Session Recovery UI Component
// src/components/dictation/SessionRecoveryPrompt.tsx

import React from 'react'
import type { SessionValidationResult } from '../../utils/sessionValidation'
// import { ExclamationTriangleIcon } from '@heroicons/react/24/outline

interface SessionRecoveryPromptProps {
  validation: SessionValidationResult
  articleTitle: string
  savedSessionInfo?: {
    lastUpdated: Date
    completedFragments: number
    totalFragments: number
    syncStatus?: 'synced' | 'pending' | 'failed'
  }
  onRestore: () => void
  onStartFresh: () => void
  onViewDetails?: () => void
}

const SessionRecoveryPrompt: React.FC<SessionRecoveryPromptProps> = ({
  validation,
  articleTitle,
  savedSessionInfo,
  onRestore,
  onStartFresh,
  onViewDetails
}) => {
  if (!validation.isValid) {
    return null
  }

  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    return date.toLocaleDateString()
  }

  const getSyncStatusIndicator = (status?: string) => {
    switch (status) {
      case 'synced':
        return <span className="text-green-600 text-xs">✓ Synced</span>
      case 'pending':
        return <span className="text-blue-600 text-xs">⏳ Sync pending</span>
      case 'failed':
        return <span className="text-orange-600 text-xs">⚠️ Sync failed</span>
      default:
        return null
    }
  }

  if (validation.canRestore) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">📝</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-blue-900 mb-1">Continue Previous Session</h3>
            <p className="text-blue-700 text-sm mb-3">
              You have a saved practice session for "{articleTitle}". 
              {savedSessionInfo && (
                <span className="block mt-1">
                  Progress: {savedSessionInfo.completedFragments} of {savedSessionInfo.totalFragments} fragments completed
                  <span className="text-blue-600 ml-2">
                    ({Math.round((savedSessionInfo.completedFragments / savedSessionInfo.totalFragments) * 100)}%)
                  </span>
                </span>
              )}
            </p>

            {savedSessionInfo && (
              <div className="flex items-center space-x-4 text-xs text-blue-600 mb-4">
                <span>Last updated: {formatLastUpdated(savedSessionInfo.lastUpdated)}</span>
                {getSyncStatusIndicator(savedSessionInfo.syncStatus)}
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button 
                onClick={onRestore}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Continue Session
              </button>
              <button 
                onClick={onStartFresh}
                className="px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Start Fresh
              </button>
              {onViewDetails && (
                <button 
                  onClick={onViewDetails}
                  className="px-3 py-1 text-blue-600 text-xs underline hover:no-underline"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (validation.requiresMigration) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-lg">⚠️</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-yellow-900 mb-1">Session Migration Required</h3>
            <p className="text-yellow-700 text-sm mb-2">
              This article has been updated since your last practice session. 
              Some progress may be preserved, but parts may be lost.
            </p>

            {savedSessionInfo && (
              <div className="bg-yellow-100 border border-yellow-200 rounded p-3 mb-3">
                <p className="text-yellow-800 text-sm font-medium mb-1">Previous Session:</p>
                <div className="text-yellow-700 text-xs space-y-1">
                  <div>• {savedSessionInfo.completedFragments} of {savedSessionInfo.totalFragments} fragments completed</div>
                  <div>• Last updated: {formatLastUpdated(savedSessionInfo.lastUpdated)}</div>
                  {savedSessionInfo.syncStatus && (
                    <div className="flex items-center space-x-2">
                      <span>• Sync status:</span>
                      {getSyncStatusIndicator(savedSessionInfo.syncStatus)}
                    </div>
                  )}
                </div>
              </div>
            )}

            <details className="mb-3">
              <summary className="text-xs text-yellow-600 cursor-pointer hover:text-yellow-700">
                Technical Details ({validation.issues.length} issues found)
              </summary>
              <div className="mt-2 ml-4">
                <ul className="text-xs text-yellow-600 space-y-1">
                  {validation.issues.map((issue, idx) => (
                    <li key={idx}>• {issue}</li>
                  ))}
                </ul>
              </div>
            </details>

            <div className="flex items-center space-x-3">
              <button 
                onClick={onRestore}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors shadow-sm"
              >
                Migrate & Continue
              </button>
              <button 
                onClick={onStartFresh}
                className="px-4 py-2 bg-white text-yellow-700 border border-yellow-300 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
              >
                Start Fresh
              </button>
            </div>

            <p className="text-xs text-yellow-600 mt-2">
              Tip: Migration will preserve progress for unchanged fragments and reset others.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default SessionRecoveryPrompt
