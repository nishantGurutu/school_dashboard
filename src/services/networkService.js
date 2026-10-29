import { API_BASE_URL, API_ENDPOINTS } from './apiConfig';
import { refreshRuntimeConfig } from './runtimeConfig';

const TOKEN_KEY = 'edudash_access_token';
const REFRESH_KEY = 'edudash_refresh_token';
const USER_KEY = 'edudash_user';

export const authStorage = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setSession: ({ accessToken, refreshToken, user }) => {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

class NetworkServiceClass {
  constructor() { this.refreshPromise = null; }

  get baseUrl() { return API_BASE_URL; }

  async refreshAccessToken(baseUrl = this.baseUrl) {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) return null;
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }), signal: AbortSignal.timeout(15000)
      });
      if ([400, 401, 403].includes(response.status)) return null;
      if (!response.ok) throw new Error('Token refresh is temporarily unavailable. Please retry.');
      const data = await response.json();
      if (!data.accessToken) throw new Error('Invalid token refresh response. Please retry.');
      authStorage.setSession({ accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        user: authStorage.getUser() || data });
      return data.accessToken;
    })();
    try { return await this.refreshPromise; }
    finally { this.refreshPromise = null; }
  }

  async request(endpoint, options = {}) {
    await refreshRuntimeConfig(endpoint.includes('/auth/login'));
    const { method = 'GET', headers = {}, body, params, baseUrl = this.baseUrl, responseType, ...customConfig } = options;

    let url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    const resolvedParams =
      params && typeof params === 'object' && params.params && typeof params.params === 'object'
        ? { ...params.params }
        : params;

    if (resolvedParams && Object.keys(resolvedParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(resolvedParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh') || endpoint.includes('/auth/logout');
    const token = authStorage.getAccessToken();
    const finalHeaders = { ...headers };

    if (body !== undefined && !(body instanceof FormData)) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    if (token && !isAuthEndpoint) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const fetchConfig = {
      method,
      headers: finalHeaders,
      ...customConfig
    };

    if (body !== undefined) {
      fetchConfig.body = body instanceof FormData || typeof body === 'string' ? body : JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(url, fetchConfig);
    } catch (fetchErr) {
      const netError = new Error('Server connection failed. Please ensure the backend server is running.');
      netError.status = 0;
      netError.apiMessage = 'Server connection failed. Please ensure the backend server is running.';
      netError.originalError = fetchErr;
      throw netError;
    }

    // Handle 401 Unauthorized (Token Expiration for authenticated requests only)
    if (response.status === 401 && token && !isAuthEndpoint) {
      // A delayed 401 may arrive after another request already refreshed.
      const currentToken = authStorage.getAccessToken();
      const newToken = currentToken && currentToken !== token
        ? currentToken : await this.refreshAccessToken(baseUrl);
      if (!newToken) {
        authStorage.clear();
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw new Error('Session expired. Please log in again.');
      }
      fetchConfig.headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, fetchConfig);
    }

    if (response.ok && responseType === 'blob') return response.blob();
    return this.parseResponse(response);
  }

  async parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/pdf')) return response.blob();
    const isJson = contentType.includes('application/json');

    let data;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch {
      data = null;
    }

    // Check if HTTP status is an error (!response.ok)
    if (!response.ok) {
      let apiMessage = '';
      if (data && typeof data === 'object') {
        apiMessage = data.message || data.error || data.detail || (data.errors && Object.values(data.errors).join(', '));
      } else if (typeof data === 'string' && data.trim()) {
        apiMessage = data.trim();
      }

      if (!apiMessage) {
        if (response.status === 401 || response.status === 403) {
          apiMessage = 'Invalid credentials';
        } else {
          apiMessage = `Request failed with status ${response.status}`;
        }
      }

      const error = new Error(apiMessage);
      error.status = response.status;
      error.apiMessage = apiMessage;
      error.data = data;
      throw error;
    }

    // Handle case where status 200 returned but body carries an error code
    if (data && typeof data === 'object' && typeof data.status === 'number' && data.status >= 400) {
      const apiMessage = data.message || data.error || data.detail || `Request failed with status ${data.status}`;
      const error = new Error(apiMessage);
      error.status = data.status;
      error.apiMessage = apiMessage;
      error.data = data;
      throw error;
    }

    return data;
  }

  // Convenient HTTP Methods
  get(endpoint, params = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET', params });
  }

  post(endpoint, body = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  patch(endpoint, body = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  upload(endpoint, formData, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: formData });
  }
}

export const NetworkService = new NetworkServiceClass();
export default NetworkService;
