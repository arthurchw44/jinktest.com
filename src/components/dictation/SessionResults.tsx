
// src/components/dictation/SessionResults.tsx

import React from 'react';
import type { DictationSession } from './FragmentDictation';
import { DictationService } from '../../services/dictationService';

// import type { SessionAnalytics } from '../../services/dictationService';

interface SessionResultsProps {
  session: DictationSession;
  onRetry?: () => void;
  onReturnToList?: () => void;
  onViewProgress?: () => void;
}

const SessionResults: React.FC<SessionResultsProps> = ({
  session,
  onRetry,
  onReturnToList,
  onViewProgress
}) => {
  const analytics = DictationService.analyzeSession(session);
  const performanceLevel = DictationService.getPerformanceLevel(analytics.averageScore);
  const accuracyTrend = DictationService.getAccuracyTrend(session.progress);
  const recommendations = DictationService.getRecommendations(session);

  const formatPercentage = (value: number) => Math.round(value * 100);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center bg-white rounded-lg shadow-sm border p-8">
        <div className="mb-4">
          {analytics.completionRate === 1 ? (
            <div className="text-6xl mb-2">🎉</div>
          ) : (
            <div className="text-6xl mb-2">📊</div>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {analytics.completionRate === 1 ? 'Congratulations!' : 'Session Complete'}
        </h1>
        
        <p className="text-xl text-gray-600 mb-4">
          {session.fragments[0]?.text ? session.fragments[0].text.substring(0, 50) + '...' : 'Dictation Practice'}
        </p>

        <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${performanceLevel.color}`}>
          {performanceLevel.level}
        </div>
        
        <p className="text-gray-600 mt-2">{performanceLevel.description}</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatPercentage(analytics.averageScore)}%
          </div>
          <div className="text-sm text-gray-600">Overall Accuracy</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {analytics.fragmentsCompleted}
          </div>
          <div className="text-sm text-gray-600">
            Fragments Completed
            <div className="text-xs text-gray-500">out of {analytics.totalFragments}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {DictationService.formatTime(analytics.totalTimeSpent)}
          </div>
          <div className="text-sm text-gray-600">Time Spent</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {analytics.averageAttemptsPerFragment.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg Attempts</div>
        </div>
      </div>

      {/* Progress Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Progress Breakdown</h2>
        
        <div className="space-y-4">
          {/* Completion Rate Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Completion Rate</span>
              <span>{formatPercentage(analytics.completionRate)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${formatPercentage(analytics.completionRate)}%` }}
              />
            </div>
          </div>

          {/* Accuracy Trend */}
          {session.progress.length > 3 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Accuracy Trend:</span>
              <div className="flex items-center space-x-1">
                {accuracyTrend.trend === 'improving' && (
                  <>
                    <span className="text-green-600">📈</span>
                    <span className="text-green-600 text-sm font-medium">Improving</span>
                  </>
                )}
                {accuracyTrend.trend === 'declining' && (
                  <>
                    <span className="text-red-600">📉</span>
                    <span className="text-red-600 text-sm font-medium">Declining</span>
                  </>
                )}
                {accuracyTrend.trend === 'stable' && (
                  <>
                    <span className="text-gray-600">➡️</span>
                    <span className="text-gray-600 text-sm font-medium">Stable</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fragment Details */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Fragment Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {session.progress.map((progress, index) => {
            const fragment = session.fragments[index];
            if (!fragment) return null;

            let statusColor = 'bg-gray-100 text-gray-600';
            let statusIcon = '⏳';
            
            if (progress.status === 'correct') {
              statusColor = 'bg-green-100 text-green-700';
              statusIcon = '✅';
            } else if (progress.status === 'given_up') {
              statusColor = 'bg-yellow-100 text-yellow-700';
              statusIcon = '💡';
            }

            return (
              <div key={index} className={`p-3 rounded-lg border-2 ${statusColor} border-opacity-20`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Fragment {index + 1}</span>
                  <span className="text-lg">{statusIcon}</span>
                </div>
                
                <div className="text-xs mb-1 truncate" title={fragment.text}>
                  {fragment.text}
                </div>
                
                <div className="flex justify-between text-xs">
                  <span>Score: {formatPercentage(progress.bestScore)}%</span>
                  <span>Tries: {progress.attempts.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths and Areas for Improvement */}
      {(analytics.strengths.length > 0 || analytics.improvements.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analytics.strengths.length > 0 && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <span className="mr-2">💪</span>
                Strengths
              </h3>
              <ul className="space-y-2">
                {analytics.strengths.map((strength, index) => (
                  <li key={index} className="text-green-700 text-sm flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analytics.improvements.length > 0 && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {analytics.improvements.map((improvement, index) => (
                  <li key={index} className="text-blue-700 text-sm flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Personalized Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-purple-700 text-sm flex items-start">
                <span className="text-purple-600 mr-2 mt-1">→</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Difficult Fragments */}
      {analytics.difficultFragments.length > 0 && (
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
            <span className="mr-2">⚠️</span>
            Challenging Fragments
          </h3>
          <p className="text-orange-700 text-sm mb-3">
            These fragments might benefit from extra practice:
          </p>
          <div className="space-y-2">
            {analytics.difficultFragments.map((progress) => {
              const fragment = session.fragments[progress.fragmentIndex];
              return (
                <div key={progress.fragmentIndex} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      Fragment {progress.fragmentIndex + 1}
                    </span>
                    <div className="text-xs text-gray-500">
                      {progress.attempts.length} attempts • {formatPercentage(progress.bestScore)}% best score
                    </div>
                  </div>
                  <p className="text-sm text-gray-800">{fragment?.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Practice Again
          </button>
        )}
        
        {onViewProgress && (
          <button
            onClick={onViewProgress}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            View Detailed Progress
          </button>
        )}
        
        {onReturnToList && (
          <button
            onClick={onReturnToList}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
          >
            Back to Articles
          </button>
        )}
      </div>

      {/* Share Results */}
      <div className="text-center border-t pt-4">
        <p className="text-sm text-gray-600 mb-2">
          Session completed on {session.startTime.toLocaleDateString()}
        </p>
        <div className="text-xs text-gray-500">
          <span>Total Score: {formatPercentage(analytics.averageScore)}%</span>
          <span className="mx-2">•</span>
          <span>Time: {DictationService.formatTime(analytics.totalTimeSpent)}</span>
          <span className="mx-2">•</span>
          <span>Completion: {formatPercentage(analytics.completionRate)}%</span>
        </div>
      </div>
    </div>
  );
};

export default SessionResults;
