import apiRequest, { authStorage } from './api';

export const authService = {
  async login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    const user = {
      userId: data.userId,
      email: data.email,
      name: data.name,
      role: data.role
    };
    authStorage.setSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user
    });
    return user;
  },

  async logout() {
    const refreshToken = authStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refreshToken }
        });
      }
    } finally {
      authStorage.clear();
    }
  },

  async getProfile() {
    const data = await apiRequest('/profile/me');
    return data.data || data;
  },

  getCurrentUser() {
    return authStorage.getUser();
  }
};