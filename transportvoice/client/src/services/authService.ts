import api from './api';

// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
  organization?: string;
}

// Login response interface
export interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Login user with email and password
 * @param email User email
 * @param password User password
 * @param rememberMe Whether to extend token expiration
 * @returns User data and token
 */
export const login = async (
  email: string, 
  password: string, 
  rememberMe: boolean = false
): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
      rememberMe
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

/**
 * Register a new user
 * @param userData User registration data
 * @returns User data and token
 */
export const register = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization?: string;
}): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/register', userData);
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local state even if server logout fails
  }
};

/**
 * Check if user is authenticated
 * @returns User data if authenticated
 */
export const checkAuth = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/me');
    
    return response.data.user;
  } catch (error) {
    return null;
  }
};

/**
 * Request password reset
 * @param email User email
 */
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await api.post('/auth/forgot-password', { email });
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Password reset request failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

/**
 * Reset password with token
 * @param token Reset token
 * @param password New password
 */
export const resetPassword = async (token: string, password: string): Promise<void> => {
  try {
    await api.post(`/auth/reset-password/${token}`, { password });
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Password reset failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

/**
 * Verify email with token
 * @param token Verification token
 */
export const verifyEmail = async (token: string): Promise<void> => {
  try {
    await api.get(`/auth/verify/${token}`);
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Email verification failed');
    }
    throw new Error('Network error. Please try again.');
  }
}; 