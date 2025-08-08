import React, { useState } from 'react';
import { useToggleUserStatus } from '../../hooks/useUsers';

interface UserStatusToggleProps {
  username: string;
  isActive: boolean;
  onSuccess?: () => void;
  size?: 'small' | 'medium';
}

export const UserStatusToggle: React.FC<UserStatusToggleProps> = ({ 
  username, 
  isActive, 
  onSuccess,
  size = 'medium'
}) => {
  const toggleStatusMutation = useToggleUserStatus();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleStatusMutation.mutateAsync(username);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    small: 'h-5 w-9',
    medium: 'h-6 w-11'
  };

  const switchClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5'
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggle}
        disabled={isToggling || toggleStatusMutation.isPending}
        className={`${sizeClasses[size]} bg-gray-200 relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive ? 'bg-green-500' : 'bg-gray-200'
        }`}
      >
        <span className="sr-only">Toggle user status</span>
        <span
          className={`${switchClasses[size]} bg-white shadow-lg rounded-full transition-transform ease-in-out duration-200 transform ${
            isActive ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      
      <span className={`text-sm font-medium ${
        isActive ? 'text-green-700' : 'text-red-700'
      }`}>
        {isToggling ? (
          <span className="text-gray-500">Updating...</span>
        ) : (
          isActive ? 'Active' : 'Inactive'
        )}
      </span>
    </div>
  );
};
