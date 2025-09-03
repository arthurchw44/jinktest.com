
import React from 'react'

interface SyncStatusIndicatorProps {
  syncStatus: {
    isUploading: boolean
    error: string | null
    lastSyncAttempt: Date | null
    failedAttempts: number
    hasPendingSync: boolean
  }
  onRetrySync?: () => Promise<void>
  onClearError?: () => void
  compact?: boolean
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  syncStatus,
  onRetrySync,
  onClearError,
  compact = false
}) => {
  if (syncStatus.isUploading) {
    return (
      <div className={`flex items-center space-x-2 text-blue-600 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Saving progress...</span>
      </div>
    )
  }

  if (syncStatus.error) {
    return (
      <div className={`flex items-center space-x-2 text-orange-600 ${compact ? 'text-xs' : 'text-sm'}`}>
        <span>⚠️</span>
        <span>
          Saved locally 
          {syncStatus.failedAttempts > 1 && (
            <span className="text-orange-700">
              ({syncStatus.failedAttempts} attempts)
            </span>
          )}
        </span>
        {onRetrySync && (
          <button 
            onClick={onRetrySync}
            className="text-orange-700 underline hover:no-underline font-medium"
          >
            retry
          </button>
        )}
        {onClearError && !compact && (
          <button 
            onClick={onClearError}
            className="text-orange-600 text-xs hover:text-orange-700"
            title="Clear error and continue offline"
          >
            ✕
          </button>
        )}
      </div>
    )
  }

  if (syncStatus.lastSyncAttempt && !syncStatus.hasPendingSync) {
    return (
      <div className={`flex items-center space-x-1 text-green-600 ${compact ? 'text-xs' : 'text-sm'}`}>
        <span>✓</span>
        <span>Progress saved</span>
        {!compact && syncStatus.lastSyncAttempt && (
          <span className="text-green-500 text-xs">
            ({formatTimeAgo(syncStatus.lastSyncAttempt)})
          </span>
        )}
      </div>
    )
  }

  if (syncStatus.hasPendingSync) {
    return (
      <div className={`flex items-center space-x-1 text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
        <span>⏳</span>
        <span>Sync pending</span>
      </div>
    )
  }

  return null
}

// Utility function for time formatting
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}
