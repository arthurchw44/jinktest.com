import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EditUserModal } from '../components/user/EditUserModal';
import { PasswordResetModal } from '../components/user/PasswordResetModal';
import { UserStatusToggle } from '../components/user/UserStatusToggle';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useDeleteUser } from '../hooks/useUsers';
import type { IUser } from '../api/apiUsers';

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, error, refetch } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    user: IUser | null;
  }>({ isOpen: false, user: null });

  const handleEditUser = (user: IUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleResetPassword = (user: IUser) => {
    setSelectedUser(user);
    setShowPasswordResetModal(true);
  };

  const handleDeleteClick = (user: IUser) => {
    setDeleteDialog({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.user) {
      try {
        await deleteUserMutation.mutateAsync(deleteDialog.user.username);
        setDeleteDialog({ isOpen: false, user: null });
        refetch();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    refetch();
    setShowEditModal(false);
    setShowPasswordResetModal(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Users</h2>
          <p className="text-red-600 mb-4">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all users in the system ({users?.length || 0} total users)
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Users</h2>
          </div>

          {!users || users.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.username} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.fullname.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullname}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UserStatusToggle
                          username={user.username}
                          isActive={user.isActive}
                          onSuccess={() => refetch()}
                          size="small"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/users/${user.username}`}
                            className="text-blue-600 hover:text-blue-900 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-green-600 hover:text-green-900 transition-colors px-2 py-1 rounded hover:bg-green-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="text-yellow-600 hover:text-yellow-900 transition-colors px-2 py-1 rounded hover:bg-yellow-50"
                          >
                            Reset Pwd
                          </button>
                          {currentUser?.username !== user.username && (
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="text-red-600 hover:text-red-900 transition-colors px-2 py-1 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showPasswordResetModal && selectedUser && (
        <PasswordResetModal
          isOpen={showPasswordResetModal}
          username={selectedUser.username}
          fullname={selectedUser.fullname}
          onClose={() => setShowPasswordResetModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteDialog.user?.fullname}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, user: null })}
      />
    </div>
  );
};

export default Users;
