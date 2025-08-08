import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LogoutAllConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const LogoutAllConfirmModal: React.FC<LogoutAllConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Logout all failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zM11 5V3a2 2 0 112 0v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Logout All Devices</h3>
              <p className="text-sm text-gray-500">End all active sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoggingOut}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              Are you sure you want to logout from all devices signed in to{' '}
              <span className="font-semibold">{user?.fullname || 'your account'}</span>?
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">This will:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>End your session on all devices and browsers</li>
                    <li>Require you to log in again everywhere</li>
                    <li>Invalidate all existing login tokens</li>
                    <li>Take effect immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              This is useful if you think someone else may have access to your account or if you want to ensure all old sessions are terminated.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoggingOut}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoggingOut ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Logging out...</span>
                </>
              ) : (
                'Logout All Devices'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
