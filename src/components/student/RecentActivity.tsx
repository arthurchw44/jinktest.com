// src/components/student/RecentActivity.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface RecentActivityProps {
  progressData?: {
    recentSessions: Array<{
      articleName: string;
      articleTitle: string;
      score: number;
      completionRate: number;
      timestamp: Date;
      fragments: number;
    }>;
  } | null;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ progressData }) => {
  const recentSessions = progressData?.recentSessions || [];

  if (recentSessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🌟</div>
          <p>Start practicing to see your recent activity here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
      
      <div className="space-y-3">
        {recentSessions.slice(0, 5).map((session, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Link
                to={`/student/practice/${session.articleName}`}
                className="font-medium text-gray-900 hover:text-blue-600"
              >
                {session.articleTitle}
              </Link>
              <div className="text-sm text-gray-500">
                {session.fragments} fragments • {Math.round(session.completionRate)}% completed
              </div>
            </div>
            
            <div className="text-right">
              <div className={`font-semibold ${
                session.score >= 80 ? 'text-green-600' : 
                session.score >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(session.score)}%
              </div>
              <div className="text-xs text-gray-500">
                {new Date(session.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {recentSessions.length > 5 && (
        <div className="text-center mt-4">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;