import React, { useState } from 'react';
import { GroupsList } from '../../components/groups/GroupsList';
import { GroupForm } from '../../components/groups/GroupForm';
import { GroupDetail } from '../../components/groups/GroupDetail';
import type { IStudentGroup } from '../../api/apiGroups';

const Groups: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [selectedGroup, setSelectedGroup] = useState<IStudentGroup | null>(null);

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setCurrentView('create');
  };

  const handleEditGroup = (group: IStudentGroup) => {
    setSelectedGroup(group);
    setCurrentView('edit');
  };

  const handleViewGroup = (group: IStudentGroup) => {
    setSelectedGroup(group);
    setCurrentView('detail');
  };

  const handleFormSuccess = () => {
    setCurrentView('list');
    setSelectedGroup(null);
  };

  const handleFormCancel = () => {
    setCurrentView('list');
    setSelectedGroup(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {currentView === 'list' && (
        <GroupsList
          onCreateGroup={handleCreateGroup}
          onEditGroup={handleEditGroup}
          onViewGroup={handleViewGroup}
        />
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <GroupForm
          group={selectedGroup || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {currentView === 'detail' && selectedGroup && (
        <GroupDetail
          group={selectedGroup}
          onClose={() => setCurrentView('list')}
          onEdit={() => setCurrentView('edit')}
        />
      )}
    </div>
  );
};

export default Groups;
