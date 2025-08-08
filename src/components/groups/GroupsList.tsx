import React, { useState } from 'react';
import { useGroups, useDeleteGroup } from '../../hooks/useGroups';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { RoleBasedComponent } from '../common/RoleBasedComponent';
import type { IStudentGroup } from '../../api/apiGroups';

interface GroupsListProps {
  onCreateGroup: () => void;
  onEditGroup: (group: IStudentGroup) => void;
  onViewGroup: (group: IStudentGroup) => void;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  onCreateGroup,
  onEditGroup,
  onViewGroup
}) => {
  const { user } = useAuth();
  const { data: groups, isLoading, error } = useGroups();
  const deleteGroupMutation = useDeleteGroup();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    group: IStudentGroup | null;
  }>({ isOpen: false, group: null });

  const handleDeleteClick = (group: IStudentGroup) => {
    setDeleteDialog({ isOpen: true, group });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.group) {
      await deleteGroupMutation.mutateAsync(deleteDialog.group._id!);
      setDeleteDialog({ isOpen: false, group: null });
    }
  };

  const canEditGroup = (group: IStudentGroup) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'teacher' && group.teacherUsername === user.username) return true;
    return false;
  };

  if (isLoading) return <LoadingSpinner message="Loading groups..." />;
  if (error) return <div className="text-red-600">Error loading groups: {(error as Error).message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Groups</h2>
        <RoleBasedComponent allowedRoles={['admin', 'teacher']}>
          <button
            onClick={onCreateGroup}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Group
          </button>
        </RoleBasedComponent>
      </div>

      {!groups || groups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No groups found. Create your first group to get started.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group._id} className="bg-white rounded-lg shadow border p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <span className="text-sm text-gray-500">
                  {group.studentUsernames?.length || 0} students
                </span>
              </div>
              
              {group.description && (
                <p className="text-gray-600 text-sm mb-2">{group.description}</p>
              )}
              
              <div className="text-xs text-gray-500 mb-3">
                Teacher: {group.teacherUsername}
                {group.metadata?.grade && ` • Grade: ${group.metadata.grade}`}
                {group.metadata?.subject && ` • Subject: ${group.metadata.subject}`}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onViewGroup(group)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View
                </button>
                {canEditGroup(group) && (
                  <>
                    <button
                      onClick={() => onEditGroup(group)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(group)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Group"
        message={`Are you sure you want to delete "${deleteDialog.group?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, group: null })}
      />
    </div>
  );
};
