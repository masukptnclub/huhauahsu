import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Loading } from './components/ui/Loading';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { UserLayout } from './components/layout/UserLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { DashboardPage as AdminDashboard } from './pages/admin/DashboardPage';
import { PackagesPage } from './pages/admin/packages/PackagesPage';
import { PackageForm } from './pages/admin/packages/PackageForm';

// User Pages
import { DashboardPage as UserDashboard } from './pages/user/DashboardPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { TryoutListPage } from './pages/user/TryoutListPage';
import { TryoutSessionPage } from './pages/user/TryoutSessionPage';

// Protected Route Component
interface ProtectedRouteProps {
  element: React.ReactNode;
  isAllowed: boolean;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  isAllowed,
  redirectPath = '/login',
}) => {
  return isAllowed ? <>{element}</> : <Navigate to={redirectPath} replace />;
};

function App() {
  const { initialize, isLoading, user, isAdmin } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return <Loading fullScreen message="Loading application..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="login" element={user ? <Navigate to="/user/dashboard" /> : <LoginPage />} />
        <Route path="register" element={user ? <Navigate to="/user/dashboard" /> : <RegisterPage />} />
        
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<div>About Page</div>} />
          <Route path="features" element={<div>Features Page</div>} />
          <Route path="contact" element={<div>Contact Page</div>} />
        </Route>
        
        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute
              element={<AdminLayout />}
              isAllowed={Boolean(user && isAdmin)}
              redirectPath="/login"
            />
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="packages/new" element={<PackageForm />} />
          <Route path="packages/:id/edit" element={<PackageForm />} />
          <Route path="subtests" element={<div>Subtests Page</div>} />
          <Route path="questions" element={<div>Questions Page</div>} />
          <Route path="sessions" element={<div>Sessions Page</div>} />
          <Route path="users" element={<div>Users Page</div>} />
          <Route path="reports" element={<div>Reports Page</div>} />
        </Route>
        
        {/* User Routes */}
        <Route
          path="user"
          element={
            <ProtectedRoute
              element={<UserLayout />}
              isAllowed={Boolean(user)}
              redirectPath="/login"
            />
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="tryouts" element={<TryoutListPage />} />
          <Route path="tryout/:sessionId" element={<TryoutSessionPage />} />
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;