// src/components/bulk/BulkExport.tsx
import React, { useState } from 'react';
import { useExportUsersCSV } from '../../hooks/useBulk';
import type { IExportFilters } from '../../api/apiBulk';

interface BulkExportProps {
  onCancel: () => void;
}

export const BulkExport: React.FC<BulkExportProps> = ({ onCancel }) => {
  const exportMutation = useExportUsersCSV();
  const [filters, setFilters] = useState<IExportFilters>({
    role: '',
    isActive: undefined,
    createdAfter: '',
    createdBefore: ''
  });

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      onCancel();
    } catch (error) {
      alert('Export failed. Please try again later.');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="mr-3">
          Role Filter:
          <select
            value={filters.role || ''}
            onChange={e => setFilters(f => ({ ...f, role: e.target.value || undefined }))}
            className="ml-2 border"
          >
            <option value="">All</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="user">User</option>
          </select>
        </label>
      </div>
      <div className="mb-4">
        <label className="mr-3">
          Status:
          <select
            value={
              filters.isActive === undefined
                ? ''
                : filters.isActive
                ? 'true'
                : 'false'
            }
            onChange={e =>
              setFilters(f => ({
                ...f,
                isActive: e.target.value === ''
                  ? undefined
                  : e.target.value === 'true'
              }))
            }
            className="ml-2 border"
          >
            <option value="">All</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </label>
      </div>
      <button
        onClick={handleExport}
        disabled={exportMutation.isPending}
        className="mr-2 px-4 py-2 bg-green-600 text-white rounded"
      >
        Export CSV
      </button>
      <button
        onClick={onCancel}
        disabled={exportMutation.isPending}
        className="px-4 py-2 border border-gray-400 rounded"
      >
        Cancel
      </button>
    </div>
  );
};
