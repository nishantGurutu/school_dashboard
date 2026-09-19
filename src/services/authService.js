import NetworkService, { authStorage } from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const authService = {
  async login(email, password) {
    const data = await NetworkService.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
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
        await NetworkService.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch (e) {
      console.warn('Logout API failed, clearing local session regardless.', e);
    } finally {
      authStorage.clear();
    }
  },

  async getProfile() {
    const data = await NetworkService.get(API_ENDPOINTS.PROFILE.ME);
    return data?.data || data;
  },

  getCurrentUser() {
    return authStorage.getUser();
  },

  isLoggedIn() {
    return Boolean(authStorage.getAccessToken());
  }
};

export default authService;