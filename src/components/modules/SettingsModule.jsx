import React, { useEffect, useState } from 'react';
import { CONFIG_BASE_URL, applyRuntimeConfig } from '../../services/runtimeConfig';
import { NetworkService } from '../../services/api';

export function SettingsModule() {
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function request(method = 'GET', body) {
    try {
      return await NetworkService.request('/admin/runtime-config', { method, body, baseUrl: CONFIG_BASE_URL, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    } catch (error) {
      if (error.status === 404) throw new Error(`Settings API is missing on ${CONFIG_BASE_URL}. Restart/deploy the updated backend.`);
      throw error;
    }
  }

  async function load() {
    setBusy(true); setMessage('');
    try { setConfig(await request()); } catch (e) { setMessage(e.message); } finally { setBusy(false); }
  }
  useEffect(() => { load(); }, []);
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const saved = await request('PUT', { liveUrl: config.liveUrl });
      setConfig(saved);
      applyRuntimeConfig(saved);
      setMessage('Live URL saved. Dashboard and app running in production mode will use it within 15 seconds. You may need to sign in again.');
    } catch (e) { setMessage(e.message); } finally { setBusy(false); }
  }
  return <section style={{ maxWidth: 760, padding: 24 }}>
    <h2>Settings — Live API URL</h2>
    <p>Update the live server URL used by the dashboard and app in production mode.</p>
    {message && <p role="status">{message}</p>}
    {!config ? <button onClick={load} disabled={busy}>{busy ? 'Loading…' : 'Retry'}</button> :
      <form onSubmit={save}>
        <fieldset disabled={busy} style={{ display: 'grid', gap: 18, padding: 20 }}>
          <legend>Live server</legend>
          <label style={{ display: 'grid', gap: 8 }}>
            Live API URL
            <input aria-label="Live API URL" type="url" required value={config.liveUrl}
              onChange={e => setConfig({ ...config, liveUrl: e.target.value })}
              placeholder="https://your-server.com/api" style={{ padding: 12, width: '100%', boxSizing: 'border-box' }} />
          </label>
          <button type="submit">{busy ? 'Saving…' : 'Save settings'}</button>
        </fieldset>
      </form>}
  </section>;
}
