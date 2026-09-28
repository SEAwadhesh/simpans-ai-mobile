import { request } from './api';
import { authStorage } from './authStorage';
import type { User } from '../types';

export interface AuthResponse {
  user: User;
  session?: {
    access_token: string;
  };
  message?: string;
}

export const authService = {
  async demoLogin(): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/demo', { method: 'POST' });
    const token = data.session?.access_token;
    if (!token) {
      throw new Error('Demo session token was not returned.');
    }
    await authStorage.setSession(token, data.user);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token =
      data.session?.access_token || `sim-${encodeURIComponent(email)}-${data.user.id}`;
    await authStorage.setSession(token, data.user);
    return data;
  },

  async signup(email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token =
      data.session?.access_token || `sim-${encodeURIComponent(email)}-${data.user.id}`;
    await authStorage.setSession(token, data.user);
    return data;
  },

  logout(): Promise<void> {
    return authStorage.clearSession();
  },

  getStoredSession() {
    return authStorage.getStoredSession();
  },

  async checkStatus() {
    return request('/auth/status');
  },
};
