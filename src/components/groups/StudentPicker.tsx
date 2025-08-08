import React, { useState, useMemo } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useManageGroupMembers } from '../../hooks/useGroups';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { IStudentGroup } from '../../api/apiGroups';

interface StudentPickerProps {
  group: IStudentGroup;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StudentPicker: React.FC<StudentPickerProps> = ({
  group,
  onSuccess,
  onCancel,
}) => {
  const { data: allUsers, isLoading } = useUsers();
  const manageGroupMembers = useManageGroupMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const availableStudents = useMemo(() => {
    if (!allUsers) return [];
    return allUsers
      .filter(
        (user) =>
          user.role === 'student' &&
          !group.studentUsernames?.includes(user.username)
      )
      .filter(
        (user) =>
          searchTerm === '' ||
          user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [allUsers, group.studentUsernames, searchTerm]);

  const handleUserToggle = (username: string) => {
    setSelectedUsers((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await manageGroupMembers.mutateAsync({
        groupId: group._id!,
        memberData: { add: selectedUsers },
      });
      onSuccess();
    } catch (error) {
      alert('Failed to add members');
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading students..." />;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <h2 className="text-xl font-bold mb-4">Add Students to "{group.name}"</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex-1 overflow-y-auto mb-4">
          {availableStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No students found matching your search.' : 'No students available to add.'}
            </div>
          ) : (
            <div className="space-y-2">
              {availableStudents.map((student) => (
                <label
                  key={student.username}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(student.username)}
                    onChange={() => handleUserToggle(student.username)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{student.fullname}</div>
                    <div className="text-sm text-gray-500">@{student.username}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedUsers.length} student{selectedUsers.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={manageGroupMembers.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleAddMembers}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={selectedUsers.length === 0 || manageGroupMembers.isPending}
            >
              {manageGroupMembers.isPending
                ? 'Adding...'
                : `Add ${selectedUsers.length} Student${selectedUsers.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
