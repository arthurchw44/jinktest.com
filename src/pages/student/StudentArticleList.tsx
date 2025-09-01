// src/pages/student/StudentArticleList.tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStudentArticles } from '../../hooks/useStudentArticles';
import { useStudentProgress } from '../../hooks/useStudentProgress';
import StudentArticleCard from '../../components/student/StudentArticleCard';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import type { IArticle } from '../../types/article.types';

type SortOption = 'recent' | 'difficulty' | 'title' | 'progress';
type FilterOption = 'all' | 'not-started' | 'in-progress' | 'completed';

const StudentArticleList: React.FC = () => {
  const { data: articles, isLoading, error } = useStudentArticles();
  const { data: progressData } = useStudentProgress();
  
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort articles
  const processedArticles = useMemo(() => {
    if (!articles) return [];

    // Only show ready articles
    let filtered = articles.filter((article:IArticle) => article.status === 'ready');

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((article:IArticle) =>
        article.title.toLowerCase().includes(query) ||
        article.articleName.toLowerCase().includes(query) ||
        article.metadata?.subject?.toLowerCase().includes(query)
      );
    }

    // Apply progress filter
    if (filterBy !== 'all') {
      filtered = filtered.filter((article:IArticle) => {
        const progress = progressData?.articleProgress?.[article.articleName];
        
        switch (filterBy) {
          case 'not-started':
            return !progress;
          case 'in-progress':
            return progress && !progress.isCompleted;
          case 'completed':
            return progress?.isCompleted;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a:IArticle, b:IArticle) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        case 'difficulty':
          const difficultyOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
          const aDiff = difficultyOrder[a.metadata?.difficulty as keyof typeof difficultyOrder] || 0;
          const bDiff = difficultyOrder[b.metadata?.difficulty as keyof typeof difficultyOrder] || 0;
          return aDiff - bDiff;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'progress':
          const aProgress = progressData?.articleProgress?.[a.articleName];
          const bProgress = progressData?.articleProgress?.[b.articleName];
          const aScore = aProgress?.bestScore || 0;
          const bScore = bProgress?.bestScore || 0;
          return bScore - aScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [articles, progressData, searchQuery, sortBy, filterBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading practice articles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Unable to Load Articles
          </h2>
          <p className="text-gray-600 mb-4">
            {(error as Error).message || 'Something went wrong loading the articles.'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalArticles = articles?.filter((a:IArticle) => a.status === 'ready').length || 0;
  const completedCount = progressData?.completedArticles?.length || 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Articles</h1>
          <p className="text-gray-600">
            {totalArticles} articles available • {completedCount} completed
          </p>
        </div>
        
        <Link
          to="/student/dashboard"
          className="mt-4 md:mt-0 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Articles
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="difficulty">Difficulty Level</option>
              <option value="title">Title (A-Z)</option>
              <option value="progress">Your Progress</option>
            </select>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter By Progress
            </label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Articles</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {processedArticles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="text-6xl mb-4">
            {searchQuery.trim() || filterBy !== 'all' ? '🔍' : '📚'}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery.trim() || filterBy !== 'all' 
              ? 'No Articles Found'
              : 'No Practice Articles Available'
            }
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchQuery.trim() || filterBy !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Your teachers haven\'t published any exercises yet. Check back later!'
            }
          </p>
          
          {(searchQuery.trim() || filterBy !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {processedArticles.length} of {totalArticles} articles
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedArticles.map((article:IArticle) => (
              <StudentArticleCard
                key={article.articleName}
                article={article}
                progress={progressData?.articleProgress?.[article.articleName]}
                showQuickStart={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentArticleList;