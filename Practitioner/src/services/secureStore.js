import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'openhand_practitioner_token';
const USER_KEY = 'openhand_practitioner_user';

export const SecureStoreService = {
  async setToken(token) {
    try {
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, String(token));
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('SecureStore setToken error:', e.message);
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore getToken error:', e.message);
      return null;
    }
  },

  async removeToken() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore removeToken error:', e.message);
    }
  },

  async setUser(user) {
    try {
      if (user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      } else {
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      console.warn('SecureStore setUser error:', e.message);
    }
  },

  async getUser() {
    try {
      const data = await SecureStore.getItemAsync(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('SecureStore getUser error:', e.message);
      return null;
    }
  },

  async clearAll() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (e) {
      console.warn('SecureStore clearAll error:', e.message);
    }
  },
};

export default SecureStoreService;
