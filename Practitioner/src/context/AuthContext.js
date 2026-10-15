import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { SecureStoreService } from '../services/secureStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from SecureStore on startup
  const loadStoredSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedToken = await SecureStoreService.getToken();
      const storedUser = await SecureStoreService.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Background sync latest profile
        try {
          const res = await apiClient.get(ENDPOINTS.PROFILE.GET_USER_DETAILS);
          if (res.data?.success && res.data?.data) {
            setUser(res.data.data);
            await SecureStoreService.setUser(res.data.data);
          }
        } catch (e) {
          if (e.response?.status === 401) {
            await SecureStoreService.clearAll();
            setToken(null);
            setUser(null);
          }
        }
      }
    } catch (e) {
      console.warn('Error loading auth session:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredSession();
  }, [loadStoredSession]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email: email.trim().toLowerCase(),
        password,
        accountType: 'Practitioner',
        expectedAccountType: 'Practitioner',
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Login failed');
      }

      const loggedUser = response.data.user;
      const authToken = response.data.token;

      // Role Mismatch Guard
      const isPractitioner =
        loggedUser?.accountType === 'Practitioner' ||
        loggedUser?.accountType === 'Instructor';

      if (!isPractitioner && loggedUser?.accountType !== 'Admin') {
        throw new Error(
          'This email is registered as a Learner account. Please use the OpenHand Learner App.'
        );
      }

      await SecureStoreService.setToken(authToken);
      await SecureStoreService.setUser(loggedUser);

      setToken(authToken);
      setUser(loggedUser);

      return { success: true, user: loggedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await SecureStoreService.clearAll();
      setToken(null);
      setUser(null);
    } catch (e) {
      console.warn('Logout error:', e.message);
    }
  };

  const updateUserData = async (newUserData) => {
    const updated = { ...user, ...newUserData };
    setUser(updated);
    await SecureStoreService.setUser(updated);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUserData,
    reloadSession: loadStoredSession,
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

export default AuthContext;
