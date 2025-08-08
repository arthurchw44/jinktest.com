import React, { useState, useEffect } from 'react';
import { useCreateGroup, useUpdateGroup } from '../../hooks/useGroups';
import type { IStudentGroup, IGroupCreate, IGroupUpdate } from '../../api/apiGroups';

interface GroupFormProps {
  group?: IStudentGroup;
  onSuccess: () => void;
  onCancel: () => void;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  group,
  onSuccess,
  onCancel
}) => {
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const isEditing = !!group;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: '',
    subject: '',
    academicYear: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        grade: group.metadata?.grade || '',
        subject: group.metadata?.subject || '',
        academicYear: group.metadata?.academicYear || ''
      });
    }
  }, [group]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const groupData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        metadata: {
          grade: formData.grade.trim() || undefined,
          subject: formData.subject.trim() || undefined,
          academicYear: formData.academicYear.trim() || undefined
        }
      };

      if (isEditing) {
        await updateGroupMutation.mutateAsync({
          groupId: group!._id!,
          groupData: groupData as IGroupUpdate
        });
      } else {
        await createGroupMutation.mutateAsync(groupData as IGroupCreate);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const isSubmitting = createGroupMutation.isPending || updateGroupMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Edit Group' : 'Create New Group'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter group name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Enter group description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 10th"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., Mathematics"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 2024-2025"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
