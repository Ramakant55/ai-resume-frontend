import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';

// User Pages
import UserDashboardPage from './pages/user/DashboardPage';
import UserApplicationsPage from './pages/user/ApplicationsPage';
import UserProfilePage from './pages/user/ProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminJobsPage from './pages/admin/JobsPage';
import AdminApplicationsPage from './pages/admin/ApplicationsPage';
import CreateJobPage from './pages/admin/CreateJobPage';

// Protected Route Components
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const App = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // If authenticated and on public route, redirect to the appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      const currentPath = window.location.pathname;
      // Check if user is on a public route (/, /login, /register, etc.)
      if (currentPath === '/' || currentPath === '/login' || currentPath === '/register' || currentPath === '/verify-otp') {
        // Redirect to the appropriate dashboard based on user role
        if (user.isAdmin) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }
    }
  }, [isAuthenticated, user, loading]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
      </Route>
      
      {/* User Routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/my-applications" element={<UserApplicationsPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
      </Route>
      
      {/* Admin Routes */}
      <Route element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/jobs" element={<AdminJobsPage />} />
        <Route path="/admin/applications" element={<AdminApplicationsPage />} />
        <Route path="/admin/create-job" element={<CreateJobPage />} />
      </Route>
    </Routes>
  );
};

export default App;
