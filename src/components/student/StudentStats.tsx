// src/components/student/StudentStats.tsx
import React from 'react';

interface StudentStatsProps {
  progressData?: {
    totalArticlesAttempted: number;
    completedArticles: string[];
    averageScore: number;
    totalTimeSpent: number;
  } | null;
}

const StudentStats: React.FC<StudentStatsProps> = ({ progressData }) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const stats = [
    {
      label: 'Articles Attempted',
      value: progressData?.totalArticlesAttempted || 0,
      icon: '📚',
      color: 'text-blue-600'
    },
    {
      label: 'Completed',
      value: progressData?.completedArticles?.length || 0,
      icon: '✅',
      color: 'text-green-600'
    },
    {
      label: 'Average Score',
      value: progressData?.averageScore ? `${Math.round(progressData.averageScore)}%` : '0%',
      icon: '🎯',
      color: 'text-yellow-600'
    },
    {
      label: 'Practice Time',
      value: formatTime(progressData?.totalTimeSpent || 0),
      icon: '⏱️',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StudentStats;