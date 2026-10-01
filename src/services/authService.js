import NetworkService, { authStorage } from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const authService = {
  async login(emailOrId, password) {
    // 1. Clear any prior session data so no stale tokens interfere
    authStorage.clear();

    const cleanInput = (emailOrId || '').trim();
    const cleanPassword = password || '';

    if (!cleanInput || !cleanPassword) {
      throw new Error('Please enter your email or ID and password.');
    }

    try {
      // 2. Send login request to backend
      const data = await NetworkService.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: cleanInput,
        password: cleanPassword
      });

      // 3. Strictly verify valid success response containing accessToken and userId
      if (!data || !data.accessToken || !data.userId) {
        const msg = (data && (data.message || data.error)) || 'Invalid credentials';
        const err = new Error(msg);
        err.apiMessage = msg;
        throw err;
      }

      const user = {
        userId: data.userId,
        email: data.email,
        name: data.name,
        role: data.role || data.userType,
        userType: data.userType,
        avatarUrl: data.avatarUrl,
        details: data.details,
        className: data.className,
        department: data.department
      };

      // 4. Save session only upon verified success
      authStorage.setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user
      });

      return {
        success: true,
        user,
        message: data.message || 'Login successful'
      };
    } catch (err) {
      authStorage.clear();
      throw err;
    }
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