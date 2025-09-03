import React from 'react';
import { Link } from 'react-router-dom';
import { useStudentsProgress } from '../../hooks/useStudentsProgress';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import ClassStatisticsCard from '../../components/teacher/ClassStatisticsCard';
import StudentProgressList from '../../components/teacher/StudentProgressList';
import AnalyticsPlaceholders from '../../components/teacher/AnalyticsPlaceholders';

const TeacherAnalytics: React.FC = () => {
  const { data: studentsData, isLoading, error } = useStudentsProgress();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading class analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Unable to Load Analytics
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || 'Something went wrong'}
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

  const students = studentsData?.students || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Analytics</h1>
          <p className="text-gray-600 mt-2">
            Monitor student progress and engagement across all activities
          </p>
        </div>
        <Link
          to="/teacher/articles"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Manage Articles
        </Link>
      </div>

      {/* Class Statistics */}
      <ClassStatisticsCard students={students} />

      {/* Student Progress List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Student Progress</h2>
        </div>
        <StudentProgressList students={students} />
      </div>

      {/* Disabled Placeholders */}
      <AnalyticsPlaceholders />
    </div>
  );
};

export default TeacherAnalytics;
