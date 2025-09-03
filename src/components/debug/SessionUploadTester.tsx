import React, { useState } from 'react';
import { createMockSession } from '../../utils/testSessionUpload';
import { useServerDictationProgress } from '../../hooks/useSessionUpload';

const SessionUploadTester: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { saveSession, isUploading, error } = useServerDictationProgress('test-article');

  const handleTestUpload = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      const mockSession = createMockSession('12345');//('test-upload-' + Date.now());
      await saveSession(mockSession);
      setTestResult('✅ Upload successful! Check browser network tab and server logs.');
    } catch (err) {
      setTestResult(`❌ Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border max-w-md">
      <h3 className="text-lg font-semibold mb-4">Session Upload Tester</h3>
      
      <button
        onClick={handleTestUpload}
        disabled={isLoading || isUploading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading || isUploading ? 'Testing Upload...' : 'Test Session Upload'}
      </button>
      
      {testResult && (
        <div className={`mt-4 p-3 rounded text-sm ${
          testResult.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {testResult}
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 text-red-700 rounded text-sm">
          Upload Error: {error.message}
        </div>
      )}
    </div>
  );
};

export default SessionUploadTester;
