import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authStorage = {
  async setToken(token: string) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async setUser(user: { userId: string; tenantId: string }) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser() {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  async clear() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
