import { useState, useEffect } from 'react';
import type { User } from './src/types';

import { Login } from './src/components/auth/Login';
import { ForgotPassword } from './src/components/auth/ForgotPassword';
import { SuperAdminDashboard } from './src/components/dashboards/SuperAdminDashboard';

import { TrainerDashboard } from './src/components/dashboards/TrainerDashboard';
import { StudentDashboard } from './src/components/dashboards/StudentDashboard';
import { getCurrentUser } from './src/lib/auth';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = getCurrentUser();

    if (token && user) {
      setCurrentUser(user);
      redirectToDashboard(user.role);
    } else {
      setCurrentRoute('/login');
    }
  }, []);

  const redirectToDashboard = (role: User['role']) => {
    switch (role) {
      case 'super_admin':
        setCurrentRoute('/dashboard/super-admin');
        break;
      
      case 'trainer':
        setCurrentRoute('/dashboard/trainer');
        break;
      case 'student':
        setCurrentRoute('/dashboard/student');
        break;
      default:
        setCurrentRoute('/login');
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    redirectToDashboard(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setCurrentRoute('/login');
  };

  const navigate = (route: string) => {
    setCurrentRoute(route);
  };

  // 🔐 PROTECTED ROUTES
  if (!currentUser && currentRoute !== '/login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToForgotPassword={() => navigate('/forgot-password')}
      />
    );
  }

  if (currentRoute === '/forgot-password') {
    return <ForgotPassword onNavigateToLogin={() => navigate('/login')} />;
  }

  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToForgotPassword={() => navigate('/forgot-password')}
      />
    );
  }

  // 🎯 DASHBOARD ROUTING
  switch (currentRoute) {
    case '/dashboard/super-admin':
      return (
        <SuperAdminDashboard
          user={currentUser}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      );
  
    case '/dashboard/trainer':
      return (
        <TrainerDashboard
          user={currentUser}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      );
    case '/dashboard/student':
      return (
        <StudentDashboard
          user={currentUser}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      );
    default:
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onNavigateToForgotPassword={() => navigate('/forgot-password')}
        />
      );
  }
}