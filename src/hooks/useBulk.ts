// src/hooks/useBulk.ts
import { useMutation } from '@tanstack/react-query';
import { 
  apiImportUsersCSV, 
  apiExportUsersCSV, 
  apiDownloadCSVTemplate,
} from '../api/apiBulk';
import type { 
  IExportFilters 
} from '../api/apiBulk';

// Import users from CSV
export const useImportUsersCSV = () => {
  return useMutation({
    mutationFn: (csvFile: File) => apiImportUsersCSV(csvFile),
  });
};

// Export users to CSV
export const useExportUsersCSV = () => {
  return useMutation({
    mutationFn: (filters?: IExportFilters) => apiExportUsersCSV(filters),
  });
};

// Download CSV template
export const useDownloadCSVTemplate = () => {
  return useMutation({
    mutationFn: () => apiDownloadCSVTemplate(),
  });
};
