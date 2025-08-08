// src/api/apiBulk.ts
import api from './axios';

export interface IBulkImportResult {
  imported: number;
  errorDetails: Array<{
    row: number;
    message: string;
    data?: any;
  }>;
}

export interface IExportFilters {
  role?: string;
  isActive?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

export const apiImportUsersCSV = async (csvFile: File): Promise<IBulkImportResult> => {
  const formData = new FormData();
  formData.append('csvFile', csvFile);
  
  const { data } = await api.post<IBulkImportResult>('/users/bulk/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const apiExportUsersCSV = async (filters?: IExportFilters): Promise<Blob> => {
  const response = await api.get('/users/bulk/export', {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
};

export const apiDownloadCSVTemplate = async (): Promise<Blob> => {
  const response = await api.get('/users/bulk/template', {
    responseType: 'blob',
  });
  return response.data;
};
