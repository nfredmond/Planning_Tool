import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

// Create a standard axios instance
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create an authenticated axios instance that includes the auth token
export const axiosAuth = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
export const setupAxiosInterceptors = (getToken: () => string | null) => {
  axiosAuth.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Hook to use authenticated axios in components
export const useAxiosAuth = () => {
  const { getToken } = useAuth();
  
  // Set up the interceptor when the hook is used
  setupAxiosInterceptors(getToken);
  
  return axiosAuth;
}; 