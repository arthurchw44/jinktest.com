// src/pages/admin/BulkOperations.tsx
import React, { useState } from 'react';
import { BulkImport } from '../../components/bulk/BulkImport';
import { BulkExport } from '../../components/bulk/BulkExport';
import { CSVTemplateDownload } from '../../components/bulk/CSVTemplateDownload';

const BulkOperations: React.FC = () => {
  const [active, setActive] = useState<'import' | 'export' | null>(null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Bulk User Operations</h1>
      <p className="mb-8">Import and export users using CSV files.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-medium mb-4">Import Users</h2>
          <BulkImport onSuccess={() => setActive(null)} onCancel={() => setActive(null)} />
          <div className="mt-4">
            <CSVTemplateDownload />
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-medium mb-4">Export Users{active?"":""}</h2>
          <BulkExport onCancel={() => setActive(null)} />
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;
