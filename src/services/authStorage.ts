import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

const TOKEN_KEY = 'simpans_token';
const USER_KEY = 'simpans_user';

export const authStorage = {
  async getToken(): Promise<string | null> {
    console.log('Getting token from AsyncStorage...:-  ' + AsyncStorage);
    console.log(
      'Getting token from AsyncStorage...:-  ' + AsyncStorage?.getItem,
    );
    console.log(
      'Getting token from AsyncStorage...:-  ' +
        AsyncStorage.getItem(TOKEN_KEY),
    );
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async setSession(token: string, user: User): Promise<void> {
    console.log('Setting session in AsyncStorage...');
    await AsyncStorage.setMany({
      [TOKEN_KEY]: token,
      [USER_KEY]: JSON.stringify(user),
    });
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.removeMany([TOKEN_KEY, USER_KEY]);
  },

  async getStoredSession(): Promise<{ user: User; token: string } | null> {
    const session = await AsyncStorage.getMany([TOKEN_KEY, USER_KEY]);
    const token = session[TOKEN_KEY];
    const userJson = session[USER_KEY];
    if (!token || !userJson) {
      return null;
    }
    try {
      return { token, user: JSON.parse(userJson) as User };
    } catch {
      return null;
    }
  },
};
