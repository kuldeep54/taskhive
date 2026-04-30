import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/');
    if (error.response) {
      if (error.response.status === 401 && !isAuthRoute) {
        // Auto logout only for protected routes, not login/register failures
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        toast.error('Access denied. You do not have permission.');
      } else if (error.response.status === 500) {
        toast.error('Internal server error. Please try again later.');
      }
    } else if (error.request) {
      toast.error('Connection failed. Please check your internet.');
    }
    return Promise.reject(error);
  }
);

export default API;
