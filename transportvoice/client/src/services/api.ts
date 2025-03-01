import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// CSRF token storage
let csrfToken: string | null = null;

/**
 * Fetch CSRF token from the server
 */
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    const response = await api.get('/csrf-token');
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
};

/**
 * Request interceptor to add CSRF token to requests
 */
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // Skip CSRF token for GET requests and login/register
    if (
      config.method?.toLowerCase() === 'get' ||
      config.url === '/auth/login' ||
      config.url === '/auth/register'
    ) {
      return config;
    }

    // If we don't have a CSRF token yet, fetch one
    if (!csrfToken) {
      try {
        await fetchCsrfToken();
      } catch (error) {
        console.error('Could not fetch CSRF token:', error);
      }
    }

    // Add CSRF token to headers
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle common errors
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear user session
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden errors (CSRF token invalid)
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      // Fetch a new CSRF token and retry the request
      try {
        await fetchCsrfToken();
        // Create a new request with the original config
        const config = error.config;
        if (csrfToken && config.headers) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
        return api(config);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 