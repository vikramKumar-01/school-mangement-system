import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details if we have an access token stored
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await api.get('/users/user-profile');
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to restore auth session:', error);
      logoutLocal();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Listen for logout events dispatched by Axios interceptors
    const handleLogoutEvent = () => {
      logoutLocal();
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/users/login', { email, password });
      const { user: userData, accessToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const logoutLocal = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      logoutLocal();
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Password update failed';
    }
  };

  const updateProfile = async (id, formData) => {
    try {
      const response = await api.put(`/users/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedUser = response.data.data;
      if (user && user._id === id) {
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    changePassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
