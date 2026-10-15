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

        // Background sync latest user profile
        try {
          const res = await apiClient.get(ENDPOINTS.PROFILE.GET_USER_DETAILS);
          if (res.data?.success && res.data?.data) {
            setUser(res.data.data);
            await SecureStoreService.setUser(res.data.data);
          }
        } catch (e) {
          // Token might be expired
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
        accountType: 'Learner',
        expectedAccountType: 'Learner',
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Login failed');
      }

      const loggedUser = response.data.user;
      const authToken = response.data.token;

      // Role Mismatch Guard
      const isLearner =
        loggedUser?.accountType === 'Learner' ||
        loggedUser?.accountType === 'Student' ||
        loggedUser?.accountType === 'Client';

      if (!isLearner && loggedUser?.accountType !== 'Admin') {
        throw new Error(
          'This email is registered as a Practitioner account. Please use the OpenHand Practitioner App.'
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

  // Send OTP for signup
  const sendOtp = async (email) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.SEND_OTP, {
        email: email.trim().toLowerCase(),
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to send OTP');
      }
      return { success: true, message: response.data.message || 'OTP sent successfully' };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.';
      return { success: false, error: message };
    }
  };

  // Signup handler
  const signup = async ({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    contactNumber,
    otp,
  }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.SIGNUP, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        contactNumber: contactNumber?.trim() || '',
        otp: otp.trim(),
        accountType: 'Learner',
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Registration failed');
      }

      const registeredUser = response.data.user;
      const authToken = response.data.token;

      if (authToken && registeredUser) {
        await SecureStoreService.setToken(authToken);
        await SecureStoreService.setUser(registeredUser);
        setToken(authToken);
        setUser(registeredUser);
      }

      return {
        success: true,
        user: registeredUser,
        token: authToken,
        message: response.data?.message || 'Account created successfully!',
      };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Registration failed. Please check your inputs.';
      return { success: false, error: message };
    }
  };

  // Request Password Reset Token
  const requestPasswordReset = async (email) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD_TOKEN, {
        email: email.trim().toLowerCase(),
      });
      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Failed to request password reset');
      }
      return { success: true, message: response.data?.message || 'Password reset link sent to your email.' };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to send reset link. Please try again.';
      return { success: false, error: message };
    }
  };

  // Quick Demo / Mockup Preview Mode
  const enterDemoMode = async () => {
    const demoUser = {
      _id: 'demo_learner_1',
      firstName: 'Aryan',
      lastName: '',
      email: 'aryan@openhand.live',
      accountType: 'Learner',
      learnerId: 'LRN-250573',
    };
    const demoToken = 'demo_mock_token';
    await SecureStoreService.setToken(demoToken);
    await SecureStoreService.setUser(demoUser);
    setToken(demoToken);
    setUser(demoUser);
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

  // Update cached user details
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
    signup,
    sendOtp,
    requestPasswordReset,
    enterDemoMode,
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
