import React from 'react';

interface StudentData {
  studentUsername: string;
  articlesAttempted: number;
  totalSessions: number;
  averageScore: number;
  completedArticles: number;
  totalTimeSpent: number;
}

interface ClassStatisticsCardProps {
  students: StudentData[];
}

const ClassStatisticsCard: React.FC<ClassStatisticsCardProps> = ({ students }) => {
  // Calculate class-wide statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.totalSessions > 0).length;
  const totalSessions = students.reduce((sum, s) => sum + s.totalSessions, 0);
  const averageScore = totalSessions > 0 
    ? Math.round(students.reduce((sum, s) => sum + (s.averageScore * s.totalSessions), 0) / totalSessions)
    : 0;
  const totalTimeSpent = Math.round(students.reduce((sum, s) => sum + s.totalTimeSpent, 0) / 60); // Convert to minutes

  const stats = [
    {
      label: 'Total Students',
      value: totalStudents,
      icon: '👥',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Students',
      value: activeStudents,
      icon: '✅',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Class Average',
      value: `${averageScore}%`,
      icon: '📊',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Practice Time',
      value: `${totalTimeSpent}min`,
      icon: '⏱️',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} mb-4`}>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <div className={`text-3xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ClassStatisticsCard;
