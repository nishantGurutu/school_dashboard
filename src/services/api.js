const BASE_URL = 'http://localhost:8080/api';

const TOKEN_KEY = 'edudash_access_token';
const REFRESH_KEY = 'edudash_refresh_token';
const USER_KEY = 'edudash_user';

export const authStorage = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  setSession: ({ accessToken, refreshToken, user }) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function refreshAccessToken() {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const user = authStorage.getUser() || {
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
    return data.accessToken;
  } catch {
    return null;
  }
}

let isRefreshing = false;
let pendingRequests = [];

function onRefreshed(token) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

export async function apiRequest(path, options = {}) {
  const { headers, body, ...rest } = options;
  const token = authStorage.getAccessToken();

  let finalHeaders = { ...(headers || {}) };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const doFetch = (accessToken) =>
    fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: accessToken
        ? { ...finalHeaders, Authorization: `Bearer ${accessToken}` }
        : finalHeaders,
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined
    });

  let response = await doFetch(token);

  if (response.status === 401 && token) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push(async (newToken) => {
          if (!newToken) {
            reject(new Error('Session expired. Please login again.'));
            return;
          }
          const retry = await doFetch(newToken);
          retry.status === 401 ? reject(new Error('Session expired. Please login again.')) : resolve(handleResponse(retry));
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    onRefreshed(newToken);
    if (newToken) {
      response = await doFetch(newToken);
    } else {
      authStorage.clear();
      window.dispatchEvent(new CustomEvent('auth:expired'));
      throw new Error('Session expired. Please login again.');
    }
  }

  return handleResponse(response);
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const raw = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      raw && raw.error
        ? raw.error
        : raw && raw.message
        ? raw.message
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return raw;
}

export default apiRequest;