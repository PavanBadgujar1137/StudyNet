import axios from 'axios';
import { BASE_URL } from './endpoints';
import { SecureStoreService } from '../services/secureStore';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT token if present
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStoreService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to attach auth token:', e.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error formatting
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || '';
      if (message.includes('token') || message.includes('expired')) {
        await SecureStoreService.clearAll();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
