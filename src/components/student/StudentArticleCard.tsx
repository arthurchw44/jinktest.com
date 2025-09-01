// src/components/student/StudentArticleCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { IArticle } from '../../types/article.types';

interface ArticleProgress {
  isCompleted: boolean;
  bestScore: number;
  completionRate: number;
  lastAttempt: Date;
  totalAttempts: number;
}

interface StudentArticleCardProps {
  article: IArticle;
  progress?: ArticleProgress;
  showQuickStart?: boolean;
}

const StudentArticleCard: React.FC<StudentArticleCardProps> = ({ 
  article, 
  progress, 
  showQuickStart = false 
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'A1': return 'bg-green-100 text-green-800';
      case 'A2': return 'bg-green-100 text-green-800';
      case 'B1': return 'bg-yellow-100 text-yellow-800';
      case 'B2': return 'bg-yellow-100 text-yellow-800';
      case 'C1': return 'bg-red-100 text-red-800';
      case 'C2': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {article.title}
          </h3>
          
          {progress?.isCompleted && (
            <div className="text-green-600 text-xl ml-2" title="Completed">
              ✓
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-3">
          {article.metadata?.difficulty && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.metadata.difficulty)}`}>
              {article.metadata.difficulty} Level
            </span>
          )}
          
          {article.metadata?.subject && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {article.metadata.subject}
            </span>
          )}

          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            {article.sentences?.length || 0} fragments
          </span>
        </div>

        {/* Progress Bar (if any progress exists) */}
        {progress && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className={`font-medium ${getProgressColor(progress.bestScore)}`}>
                {Math.round(progress.bestScore)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.completionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>By {article.teacherUsername}</span>
          <span>{article.createdAt? formatDate(article.createdAt):""}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        {progress ? (
          <div className="space-y-2">
            {/* Progress Summary */}
            <div className="text-xs text-gray-500 flex justify-between">
              <span>{progress.totalAttempts} attempts</span>
              <span>
                Last: {new Date(progress.lastAttempt).toLocaleDateString()}
              </span>
            </div>

            {/* Action Button */}
            <Link
              to={`/student/practice/${article.articleName}`}
              className={`block w-full px-4 py-2 rounded-lg text-center font-medium transition-colors ${
                progress.isCompleted
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {progress.isCompleted ? 'Practice Again' : 'Continue'}
            </Link>
          </div>
        ) : (
          <Link
            to={`/student/practice/${article.articleName}`}
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
          >
            Start Practice
          </Link>
        )}
      </div>
    </div>
  );
};

export default StudentArticleCard;