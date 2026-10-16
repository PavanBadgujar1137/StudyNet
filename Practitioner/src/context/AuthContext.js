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

  // Quick Demo Preview Mode for testing/evaluating without live credentials
  const enterDemoMode = async () => {
    const demoUser = {
      _id: 'demo_practitioner_1',
      firstName: 'Dr. Evelyn',
      lastName: 'Vance',
      email: 'evelyn.vance@openhand.live',
      accountType: 'Practitioner',
      handle: 'dr-evelyn-vance',
      contactNumber: '+1 (555) 234-5678',
      specialties: ['Somatic Experiencing', 'Nervous System Care', 'Integrative Therapy'],
      isVerified: true,
      rating: 5.0,
      activeClientsCount: 18,
    };
    const demoToken = 'demo_practitioner_jwt_token';
    await SecureStoreService.setToken(demoToken);
    await SecureStoreService.setUser(demoUser);
    setToken(demoToken);
    setUser(demoUser);
    return { success: true, user: demoUser };
  };

  // Send OTP for signup/verification
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

  // Practitioner Registration handler
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
        accountType: 'Practitioner',
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
        message: response.data?.message || 'Practitioner account created successfully!',
      };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Registration failed. Please verify your inputs.';
      return { success: false, error: message };
    }
  };

  // Request Password Reset
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

  // Logout handler
  const logout = async () => {
    try {
      await SecureStoreService.clearAll();
      if (apiClient.defaults?.headers?.common) {
        delete apiClient.defaults.headers.common['Authorization'];
      }
    } catch (e) {
      console.warn('Logout error:', e.message);
    } finally {
      setToken(null);
      setUser(null);
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
