import React from 'react';
import { useDownloadCSVTemplate } from '../../hooks/useBulk';

export const CSVTemplateDownload: React.FC = () => {
  const downloadTemplateMutation = useDownloadCSVTemplate();

  const handleDownload = async () => {
    try {
      const blob = await downloadTemplateMutation.mutateAsync();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'users-import-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download failed:', error);
      alert('Template download failed. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      disabled={downloadTemplateMutation.isPending}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {downloadTemplateMutation.isPending ? 'Downloading...' : 'Download Template'}
    </button>
  );
};
