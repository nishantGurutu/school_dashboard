import { API_BASE_URL, API_ENDPOINTS } from './apiConfig';

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
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  onRefreshed(token) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  addRefreshSubscriber(cb) {
    this.refreshSubscribers.push(cb);
  }

  async refreshAccessToken() {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) return null;

      const data = await response.json();
      const currentUser = authStorage.getUser() || {
        userId: data.userId,
        email: data.email,
        name: data.name,
        role: data.role
      };

      authStorage.setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        user: currentUser
      });

      return data.accessToken;
    } catch {
      return null;
    }
  }

  async request(endpoint, options = {}) {
    const { method = 'GET', headers = {}, body, params, ...customConfig } = options;

    let url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const token = authStorage.getAccessToken();
    const finalHeaders = { ...headers };

    if (body !== undefined && !(body instanceof FormData)) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const fetchConfig = {
      method,
      headers: finalHeaders,
      ...customConfig
    };

    if (body !== undefined) {
      fetchConfig.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    let response = await fetch(url, fetchConfig);

    // Handle 401 Unauthorized (Token Expiration)
    if (response.status === 401 && token) {
      if (this.isRefreshing) {
        const newToken = await new Promise((resolve) => {
          this.addRefreshSubscriber(resolve);
        });

        if (newToken) {
          fetchConfig.headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, fetchConfig);
        } else {
          authStorage.clear();
          window.dispatchEvent(new CustomEvent('auth:expired'));
          throw new Error('Session expired. Please log in again.');
        }
      } else {
        this.isRefreshing = true;
        const newToken = await this.refreshAccessToken();
        this.isRefreshing = false;

        this.onRefreshed(newToken);

        if (newToken) {
          fetchConfig.headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, fetchConfig);
        } else {
          authStorage.clear();
          window.dispatchEvent(new CustomEvent('auth:expired'));
          throw new Error('Session expired. Please log in again.');
        }
      }
    }

    return this.parseResponse(response);
  }

  async parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let data;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch {
      data = null;
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      if (typeof data === 'string' && data) {
        errorMessage = data;
      } else if (data && typeof data === 'object') {
        errorMessage = data.message || data.error || data.detail || errorMessage;
      }
      const error = new Error(errorMessage);
      error.status = response.status;
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
