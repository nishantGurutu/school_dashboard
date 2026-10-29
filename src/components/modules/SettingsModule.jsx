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
      const saved = await request('PUT', config);
      setConfig(saved);
      applyRuntimeConfig({ activeUrl: saved.environment === 'live' ? saved.liveUrl : saved.developmentUrl });
      setMessage('Both URLs and the selected environment have been saved to the database. Dashboard and mobile app use the selected URL within 15 seconds. A separate server may require signing in again.');
    } catch (e) { setMessage(e.message); } finally { setBusy(false); }
  }
  return <section style={{ maxWidth: 760, padding: 24 }}>
    <h2>Settings — API Environment</h2>
    <p>Select the environment shared by the dashboard and Flutter app. Both URLs and the selected environment are stored in the database. This screen loads the saved values whenever you open it. Click Save settings to apply changes.</p>
    <p style={{ overflowWrap: 'anywhere' }}>Configuration server: {CONFIG_BASE_URL}</p>
    {message && <p role="status">{message}</p>}
    {!config ? <button onClick={load} disabled={busy}>{busy ? 'Loading…' : 'Retry'}</button> :
      <form onSubmit={save}>
        <fieldset disabled={busy} style={{ display: 'grid', gap: 18, padding: 20 }}>
          <legend>Active environment</legend>
          {['live', 'development'].map(env => <label key={env} style={{ display: 'grid', gap: 8 }}>
            <span><input type="radio" name="environment" checked={config.environment === env}
              onChange={() => setConfig({ ...config, environment: env })} /> {env === 'live' ? 'Live' : 'Development'}</span>
            <input aria-label={`${env} API URL`} type="url" required value={config[`${env}Url`]}
              onChange={e => setConfig({ ...config, [`${env}Url`]: e.target.value })}
              placeholder="https://your-server.com/api" style={{ padding: 12, width: '100%', boxSizing: 'border-box' }} />
          </label>)}
          <p>Use a full HTTP(S) server URL. /api is added automatically. Development must be reachable from the phone; localhost refers to the phone itself.</p>
          <button type="submit">{busy ? 'Saving…' : 'Save settings'}</button>
        </fieldset>
      </form>}
  </section>;
}
