/**
 * SecureStore Service with web fallback to localStorage.
 * On native (iOS/Android) it uses expo-secure-store for encrypted storage.
 * On web it falls back to localStorage so the app works correctly in browser preview.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'openhand_practitioner_token';
const USER_KEY = 'openhand_practitioner_user';

// ─── Web localStorage shim ───────────────────────────────────────────────────
const webStore = {
  setItemAsync: async (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) { /* private mode */ }
  },
  getItemAsync: async (key) => {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  },
  deleteItemAsync: async (key) => {
    try { localStorage.removeItem(key); } catch (_) { /* ignore */ }
  },
};

// Pick the right store at module load time (avoids per-call Platform checks)
const store = Platform.OS === 'web' ? webStore : SecureStore;

// ─── Service API ─────────────────────────────────────────────────────────────
export const SecureStoreService = {
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

  async getToken() {
    try {
      return await store.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore getToken error:', e.message);
      return null;
    }
  },

  async removeToken() {
    try {
      await store.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore removeToken error:', e.message);
    }
  },

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

  async getUser() {
    try {
      const data = await store.getItemAsync(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('SecureStore getUser error:', e.message);
      return null;
    }
  },

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
