// import axios, { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const api = axios.create({ baseURL: apiBaseUrl });

// attach JWT before every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
