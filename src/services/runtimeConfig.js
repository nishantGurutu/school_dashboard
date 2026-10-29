const defaultConfigUrl = import.meta.env?.DEV ? 'http://localhost:8080/api' : 'https://school-springboot-backend.onrender.com/api';
export const CONFIG_BASE_URL = (import.meta.env?.VITE_CONFIG_BASE_URL || defaultConfigUrl).replace(/\/+$/, '');
export const DEFAULT_API_URL = import.meta.env?.VITE_API_BASE_URL || CONFIG_BASE_URL;
let pending;
let lastCheck = 0;
let configRevision = 0;
const cacheKey = `runtime_api_url:${CONFIG_BASE_URL}`;
let selectedUrl = DEFAULT_API_URL;
try {
  const cached = localStorage.getItem(cacheKey);
  if (cached && ['http:', 'https:'].includes(new URL(cached).protocol)) selectedUrl = cached;
} catch { /* Storage may be unavailable. */ }
const listeners = new Set();
export const onRuntimeUrl = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export function applyRuntimeConfig(config) {
  const url = new URL(config.activeUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Invalid API URL');
  configRevision++;
  selectedUrl = config.activeUrl.replace(/\/+$/, '');
  try { localStorage.setItem(cacheKey, selectedUrl); } catch { /* Storage may be unavailable. */ }
  listeners.forEach(listener => listener(selectedUrl));
}
export function refreshRuntimeConfig(force = false) {
  if (pending) return pending;
  if (!force && Date.now() - lastCheck < 15000) return Promise.resolve();
  const requestedRevision = configRevision;
  pending = (async () => {
    try {
      const response = await fetch(`${CONFIG_BASE_URL}/runtime-config`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Configuration unavailable');
      const config = await response.json();
      if (requestedRevision === configRevision) applyRuntimeConfig(config);
    } catch (error) { console.warn('Using last known API configuration:', error.message); }
    finally { lastCheck = Date.now(); pending = null; }
  })();
  return pending;
}
export const getRuntimeUrl = () => selectedUrl;
