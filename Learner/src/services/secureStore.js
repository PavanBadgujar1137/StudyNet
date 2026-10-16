import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'openhand_auth_token';
const USER_KEY = 'openhand_auth_user';

// Web localStorage shim for browser preview
const webStore = {
  setItemAsync: async (key, value) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (_) {}
  },
  getItemAsync: async (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (_) {
      return null;
    }
  },
  deleteItemAsync: async (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (_) {}
  },
};

// Select the appropriate storage backend at runtime
const store = Platform.OS === 'web' ? webStore : SecureStore;

export const SecureStoreService = {
  /**
   * Store JWT Auth Token
   */
  async setToken(token) {
    try {
      if (token) {
        await store.setItemAsync(TOKEN_KEY, String(token));
      } else {
        await store.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('SecureStore setToken error:', e.message);
    }
  },

  /**
   * Retrieve JWT Auth Token
   */
  async getToken() {
    try {
      return await store.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore getToken error:', e.message);
      return null;
    }
  },

  /**
   * Remove JWT Auth Token
   */
  async removeToken() {
    try {
      await store.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore removeToken error:', e.message);
    }
  },

  /**
   * Store cached User details
   */
  async setUser(user) {
    try {
      if (user) {
        await store.setItemAsync(USER_KEY, JSON.stringify(user));
      } else {
        await store.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      console.warn('SecureStore setUser error:', e.message);
    }
  },

  /**
   * Retrieve cached User details
   */
  async getUser() {
    try {
      const data = await store.getItemAsync(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('SecureStore getUser error:', e.message);
      return null;
    }
  },

  /**
   * Clear all stored session items
   */
  async clearAll() {
    try {
      await store.deleteItemAsync(TOKEN_KEY);
      await store.deleteItemAsync(USER_KEY);
    } catch (e) {
      console.warn('SecureStore clearAll error:', e.message);
    }
  },
};

export default SecureStoreService;
