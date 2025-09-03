// src/pages/teacher/StudentAnalytics.tsx
import React from 'react';
import StudentProgressDashboard from '../../components/teacher/StudentProgressDashboard';

const StudentAnalytics: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Student Progress</h1>
      <StudentProgressDashboard />
    </div>
  );
};

export default StudentAnalytics;
