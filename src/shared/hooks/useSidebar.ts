import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User } from '../../domains/user/models/userModels';
import { useSidebarContext } from '../contexts/SidebarContext';

export const useSidebar = (role: 'teacher' | 'student') => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const { expanded, toggleExpanded } = useSidebarContext();

  useEffect(() => {
    const getUserFromLocalStorage = () => {
      const userStr = localStorage.getItem('user');

      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    };

    getUserFromLocalStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing updated user data from localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getUserName = () => {
    if (!user) return 'User';

    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    return user.email?.split('@')[0] || String(user.id);
  };

  const getUserInitials = () => {
    if (!user) return '?';

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName[0].toUpperCase();
    } else if (user.lastName) {
      return user.lastName[0].toUpperCase();
    }

    return user.email?.[0]?.toUpperCase() || '?';
  };

  const teacherLinks = [
    { to: '/teacher', label: 'Dashboard', icon: 'Home' },
    { to: '/teacher/promotions', label: 'Promotions', icon: 'Users' },
  ];

  const studentLinks = [
    { to: '/student', label: 'Dashboard', icon: 'Home' },
  ];

  const links = role === 'teacher' ? teacherLinks : studentLinks;

  const isLinkActive = (path: string) => location.pathname === path;

  return {
    expanded,
    toggleExpanded,
    user,
    getUserName,
    getUserInitials,
    links,
    isLinkActive
  };
};
