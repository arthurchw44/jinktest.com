import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useGroups } from '../hooks/useGroups';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BulkImport } from '../components/bulk/BulkImport';
import { BulkExport } from '../components/bulk/BulkExport';
import { CSVTemplateDownload } from '../components/bulk/CSVTemplateDownload';
import { CreateUserModal } from '../components/user/CreateUserModal';

const AdminDashboard: React.FC = () => {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkExport, setShowBulkExport] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  
  if (usersLoading || groupsLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const userStats = users ? {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    students: users.filter(u => u.role === 'student').length,
    users: users.filter(u => u.role === 'user').length,
  } : null;

  const groupStats = groups ? {
    total: groups.length,
    totalStudents: groups.reduce((sum, g) => sum + (g.studentUsernames?.length || 0), 0)
  } : null;


  

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats?.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Groups</p>
              <p className="text-2xl font-semibold text-gray-900">{groupStats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students in Groups</p>
              <p className="text-2xl font-semibold text-gray-900">{groupStats?.totalStudents || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">Bulk Operations</h3>
            <p className="text-sm text-gray-600 mb-3">Import or export users in bulk using CSV files.</p>
            <div className="space-y-2">
              <button
                onClick={() => setShowBulkImport(true)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Import Users (CSV)
              </button>
              <button
                onClick={() => setShowBulkExport(true)}
                className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
              >
                Export Users (CSV)
              </button>
              <CSVTemplateDownload />
            </div>
          </div>
{/* 
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">User Management</h3>
            <p className="text-sm text-gray-600 mb-3">Manage users, roles, and permissions.</p>
            <div className="space-y-2">
              <a
                href="/admin/users"
                className="block w-full bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 text-center"
              >
                Manage Users
              </a>
            </div>
          </div> */}

          {/* // Add this button in the dashboard (replace the existing user management section): */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">User Management</h3>
            <p className="text-sm text-gray-600 mb-3">Manage users, roles, and permissions.</p>
            <div className="space-y-2">
              <button
                onClick={() => setShowCreateUser(true)}
                className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New User
              </button>
              <a href="/admin/users" className="block w-full bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 text-center transition-colors">
                Manage Users
              </a>
            </div>
          </div>



          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">Group Management</h3>
            <p className="text-sm text-gray-600 mb-3">Manage student groups and assignments.</p>
            <div className="space-y-2">
              <a
                href="/admin/groups"
                className="block w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 text-center"
              >
                Manage Groups
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bulk Operation Modals */}
      {showBulkImport && (
        <BulkImport
          onSuccess={() => setShowBulkImport(false)}
          onCancel={() => setShowBulkImport(false)}
        />
      )}

      {showBulkExport && (
        <BulkExport
          onCancel={() => setShowBulkExport(false)}
        />
      )}

      {showCreateUser && (
        <CreateUserModal
          isOpen={showCreateUser}
          onClose={() => setShowCreateUser(false)}
          onSuccess={() => {
            // Refresh any data if needed
            console.log('User created successfully');
          }}
        />
      )}

    </div>
  );
};

export default AdminDashboard;
