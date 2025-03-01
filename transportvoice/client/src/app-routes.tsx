import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import theme
import { theme } from './theme/theme';

// Context providers
import { AuthProvider } from './context/AuthContext';

// Layout components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Common components
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ProjectPage from './pages/projects/ProjectPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import AdminDashboard from './components/admin/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

const AppRoutes: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout children={<Outlet />} />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="verify-email/:token" element={<VerifyEmailPage />} />
              <Route path="projects" element={<ProjectsListPage />} />
              <Route path="projects/:slug" element={<ProjectPage />} />
            </Route>
            
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['admin', 'moderator']}>
                  <AdminLayout children={<AdminDashboard />} />
                </ProtectedRoute>
              }
            />
            
            {/* Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default AppRoutes; 