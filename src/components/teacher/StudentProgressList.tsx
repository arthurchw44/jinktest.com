import React from 'react';

interface StudentData {
  studentUsername: string;
  articlesAttempted: number;
  totalSessions: number;
  averageScore: number;
  completedArticles: number;
  totalTimeSpent: number;
  recentActivity?: Array<{
    articleName: string;
    score: number;
    timestamp: string;
  }>;
}

interface StudentProgressListProps {
  students: StudentData[];
}

const StudentProgressList: React.FC<StudentProgressListProps> = ({ students }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getActivityStatus = (student: StudentData) => {
    if (student.totalSessions === 0) return { text: 'No Activity', color: 'text-gray-500' };
    
    const lastActivity = student.recentActivity?.[0];
    if (lastActivity) {
      const daysSince = Math.floor((Date.now() - new Date(lastActivity.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince === 0) return { text: 'Active Today', color: 'text-green-600' };
      if (daysSince <= 3) return { text: `${daysSince}d ago`, color: 'text-blue-600' };
      if (daysSince <= 7) return { text: `${daysSince}d ago`, color: 'text-yellow-600' };
    }
    return { text: 'Inactive', color: 'text-gray-500' };
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Student Data Available
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Students haven't started practicing yet. Once they begin using the system, 
          their progress will appear here.
        </p>
      </div>
    );
  }

  // Sort students by activity (total sessions descending)
  const sortedStudents = [...students].sort((a, b) => b.totalSessions - a.totalSessions);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Articles
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sessions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Average Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedStudents.map((student) => {
            const status = getActivityStatus(student);
            return (
              <tr key={student.studentUsername} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {student.studentUsername.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.studentUsername}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1">
                    <div>{student.articlesAttempted} attempted</div>
                    <div className="text-xs text-gray-500">
                      {student.completedArticles} completed
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.totalSessions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {student.totalSessions > 0 ? (
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(student.averageScore)}`}>
                      {Math.round(student.averageScore)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    disabled
                    className="text-gray-400 cursor-not-allowed"
                    title="Coming Soon"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentProgressList;
