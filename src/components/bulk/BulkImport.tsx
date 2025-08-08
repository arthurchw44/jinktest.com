import React, { useState, useRef } from 'react';
import { useImportUsersCSV } from '../../hooks/useBulk';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface BulkImportProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BulkImport: React.FC<BulkImportProps> = ({
  onSuccess,
  onCancel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const importMutation = useImportUsersCSV();

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await importMutation.mutateAsync(selectedFile);
      
      // console.log(result);

      if (result.errorDetails.length > 0) {
        alert(`Import completed with issues:\n- Imported: ${result.imported}\n- Errors: ${result.errorDetails.length}\n\nCheck console for error details.`);
        console.log('Import errors:', result.errorDetails);
      } else {
        alert(`Successfully imported ${result.imported} users!`);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format and try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Bulk Import Users</h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : selectedFile
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div>
              <div className="text-green-600 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="font-medium text-green-700">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-sm text-red-600 hover:text-red-800 mt-2"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div>
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-600">Drag & drop your CSV file here</p>
              <p className="text-sm text-gray-500 mt-1">or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                browse files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p><strong>CSV Format:</strong> username, fullname, role, password (optional)</p>
          <p>Supported roles: admin, teacher, student, user</p>
        </div>

        {importMutation.isPending && (
          <div className="mb-4">
            <LoadingSpinner message="Importing users..." size="small" />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={importMutation.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={!selectedFile || importMutation.isPending}
          >
            {importMutation.isPending ? 'Importing...' : 'Import Users'}
          </button>
        </div>
      </div>
    </div>
  );
};
