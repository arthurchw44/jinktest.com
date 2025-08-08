// src/components/groups/GroupDetail.tsx
import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../context/AuthContext';
import { useManageGroupMembers } from '../../hooks/useGroups';
import { RoleBasedComponent } from '../common/RoleBasedComponent';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MemberPicker } from './MemberPicker';
import type { IStudentGroup } from '../../api/apiGroups';

interface GroupDetailProps {
  group: IStudentGroup;
  onClose: () => void;
  onEdit: () => void;
}

export const GroupDetail: React.FC<GroupDetailProps> = ({
  group,
  onClose,
  onEdit
}) => {
  const { user } = useAuth();
  const { data: allUsers } = useUsers();
  const manageGroupMembers = useManageGroupMembers();
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [removeDialog, setRemoveDialog] = useState<{
    isOpen: boolean;
    username: string | null;
    fullname: string | null;
  }>({ isOpen: false, username: null, fullname: null });

  // Filter users for members in this group
  const groupMembers = allUsers?.filter(
    u => group.studentUsernames?.includes(u.username)
  ) || [];

  const canManage =
    user &&
    (user.role === 'admin' ||
      (user.role === 'teacher' && user.username === group.teacherUsername));

  const handleRemoveConfirm = async () => {
    if (removeDialog.username) {
      await manageGroupMembers.mutateAsync({
        groupId: group._id!,
        memberData: { remove: [removeDialog.username] }
      });
      setRemoveDialog({ isOpen: false, username: null, fullname: null });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{group.name}</h2>
            <button onClick={onClose} aria-label="Close">&times;</button>
          </div>
          <p>{group.description}</p>
          <div className="grid grid-cols-2 gap-4 my-4">
            <span>Teacher: {group.teacherUsername}</span>
            {group.metadata?.grade && <span>Grade: {group.metadata.grade}</span>}
            {group.metadata?.subject && <span>Subject: {group.metadata.subject}</span>}
            {group.metadata?.academicYear && <span>Year: {group.metadata.academicYear}</span>}
          </div>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Members</h3>
              <RoleBasedComponent allowedRoles={['admin', 'teacher']}>
                {canManage && (
                  <button onClick={() => setShowMemberPicker(true)} className="text-blue-600">
                    Add Students
                  </button>
                )}
              </RoleBasedComponent>
            </div>
            <ul>
              {groupMembers.map(m => (
                <li key={m.username} className="flex justify-between items-center">
                  <span>
                    {m.fullname} ({m.username})
                  </span>
                  {canManage && (
                    <button
                      className="text-red-600 text-sm"
                      onClick={() => setRemoveDialog({
                        isOpen: true,
                        username: m.username,
                        fullname: m.fullname
                      })}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
              {groupMembers.length === 0 && <li className="text-gray-500">No students yet.</li>}
            </ul>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={onClose} className="border px-4 py-2 rounded">Close</button>
            {canManage && (
              <button onClick={onEdit} className="bg-blue-600 text-white px-4 py-2 rounded">Edit Group</button>
            )}
          </div>
        </div>
      </div>
      {/* MemberPicker Modal */}
      {showMemberPicker && (
        <MemberPicker
          group={group}
          onSuccess={() => setShowMemberPicker(false)}
          onCancel={() => setShowMemberPicker(false)}
        />
      )}
      {/* Remove member confirmation */}
      <ConfirmDialog
        isOpen={removeDialog.isOpen}
        title="Remove Student"
        message={`Are you sure you want to remove "${removeDialog.fullname}" from this group?`}
        confirmText="Remove"
        cancelText="Cancel"
        type="warning"
        onConfirm={handleRemoveConfirm}
        onCancel={() => setRemoveDialog({ isOpen: false, username: null, fullname: null })}
      />
    </>
  );
};
