import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const StudentProgressDashboard: React.FC = () => {
  const { data: studentsProgress, isLoading } = useQuery({
    queryKey: ['teacher-analytics', 'students'],
    queryFn: async () => {
      const response = await api.get('/sessions/analytics/students');
      return response.data.students;
    }
  });

  if (isLoading) return <div>Loading student progress...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Student Progress Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentsProgress?.map((student: any) => (
          <div key={`${student.studentUsername}-${student.articleName}`} 
               className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">{student.studentUsername}</h3>
            <p className="text-gray-600 mb-2">{student.articleName}</p>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Best Score:</span>
                <span className="ml-2 font-medium">{Math.round(student.bestScore * 100)}%</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Average Score:</span>
                <span className="ml-2 font-medium">{Math.round(student.averageScore * 100)}%</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Completion Rate:</span>
                <span className="ml-2 font-medium">{Math.round(student.completionRate)}%</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Time Spent:</span>
                <span className="ml-2 font-medium">{Math.round(student.totalTimeSpent / 60)} min</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Last Practiced:</span>
                <span className="ml-2 text-sm">{new Date(student.lastPracticed).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentProgressDashboard;
