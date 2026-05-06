import { User, UserRole } from '../types';


export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("currentUser");

  if (!token || !user) return null;

  return JSON.parse(user);
};

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const logout = (): void => {
  localStorage.removeItem("token"); // ✅ IMPORTANT
  setCurrentUser(null);
};
export const getDefaultRoute = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return '/dashboard/super-admin';
    case 'manager':
      return '/dashboard/manager';
    case 'trainer':
      return '/dashboard/trainer';
    case 'student':
      return '/dashboard/student';
    default:
      return '/login';
  }
};
