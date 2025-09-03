// src/pages/student/StudentArticleList.tsx
import  { useMemo, useState } from 'react';
import { useStudentArticles } from '../../hooks/useStudentArticles';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import StudentArticleCard from '../../components/student/StudentArticleCard';
import type {IArticle} from '../../types/article.types';
import { useMyProgressMap } from '../../hooks/useMyProgressMap';

export default function StudentArticleList() {
  const { data: articles, isLoading, error } = useStudentArticles();
  const [sortBy, setSortBy] = useState<'recent' | 'difficulty' | 'title' | 'progress'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const readyArticles = useMemo(
    () => (articles ?? []).filter((a: IArticle) => a.status === 'ready'),
    [articles]
  );

  const articleNames = useMemo(() => readyArticles.map((a:IArticle) => a.articleName), [readyArticles]);
  const { data: progressMap, isLoading: progressLoading } = useMyProgressMap(articleNames);

  (false && setSortBy('recent')); // to avoid unused var warnings
  (false && setFilterBy('all'));
  (false && setSearchQuery(''));
  
  if (isLoading || progressLoading) {
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to Load Articles</h2>
          <p className="text-gray-600 mb-4">{(error as Error).message ?? 'Something went wrong'}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const processedArticles = useMemo(() => {
    let filtered = [...readyArticles];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.articleName.toLowerCase().includes(q) ||
        a.metadata?.subject?.toLowerCase().includes(q)
      );
    }

    if (filterBy !== 'all') {
      filtered = filtered.filter((a) => {
        const p = progressMap?.[a.articleName];
        switch (filterBy) {
          case 'not-started':
            return !p;
          case 'in-progress':
            return !!p && !p.isCompleted;
          case 'completed':
            return !!p?.isCompleted;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        case 'difficulty': {
          const order: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
          const aD = order[a.metadata?.difficulty ?? ''] ?? 0;
          const bD = order[b.metadata?.difficulty ?? ''] ?? 0;
          return aD - bD;
        }
        case 'title':
          return a.title.localeCompare(b.title);
        case 'progress': {
          const ap = progressMap?.[a.articleName]?.bestScore ?? 0;
          const bp = progressMap?.[b.articleName]?.bestScore ?? 0;
          return bp - ap;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [readyArticles, searchQuery, filterBy, sortBy, progressMap]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* controls ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedArticles.map((article) => {
          const p = progressMap?.[article.articleName];
          return (
            <StudentArticleCard
              key={article.articleName}
              article={article}
              progress={p}           // now matches the card’s expected type
              showQuickStart={false}
            />
          );
        })}
      </div>
    </div>
  );
}
