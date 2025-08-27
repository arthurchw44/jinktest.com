// src/api/axios.ts
import axios from 'axios';
import { getAuthToken, clearAuthToken } from '../utils/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401/403 by redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - clear and redirect to login
      clearAuthToken();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);




export default api;
