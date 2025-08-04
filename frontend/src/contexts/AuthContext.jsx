import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { authAPI, tokenManager } from '@/lib/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (token) {
        const response = await authAPI.me();
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, accessToken, refreshToken } = response.data;
      
      tokenManager.setTokens(accessToken, refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful! Welcome to SentiBlog!');
      router.push('/');
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, accessToken, refreshToken } = response.data;
      
      tokenManager.setTokens(accessToken, refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${user.username}!`);
      
      // Redirect to intended page or home
      const redirect = router.query.redirect || '/';
      router.push(redirect);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};