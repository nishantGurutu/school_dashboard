import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

test('accountant login stores verified session and clears failed logins', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) };
  try {
    const { default: network, authStorage } = await server.ssrLoadModule('/src/services/networkService.js');
    const { authService } = await server.ssrLoadModule('/src/services/authService.js');
    network.post = async (_url, body) => {
      assert.equal(body.email, 'ACC-42');
      return {accessToken:'verified',refreshToken:'refresh',userId:42,role:'ACCOUNTANT',email:'accountant@test.local'};
    };
    const result = await authService.login(' ACC-42 ', 'secret');
    assert.equal(result.success,true);
    assert.equal(authStorage.getUser().role,'ACCOUNTANT');
    assert.equal(authStorage.getAccessToken(),'verified');
    network.post = async () => { throw new Error('Invalid credentials'); };
    await assert.rejects(authService.login('ACC-42','wrong'), /Invalid credentials/);
    assert.equal(authStorage.getAccessToken(),null);
    network.post = async () => ({message:'Invalid credentials'});
    await assert.rejects(authService.login('ACC-42','wrong'), /Invalid credentials/);
    assert.equal(authStorage.getUser(),null);
  } finally { delete globalThis.localStorage; await server.close(); }
});

test('accountant finance dashboard renders', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { AccountantDashboard } = await server.ssrLoadModule('/src/components/dashboard/AccountantDashboard.jsx');
    const { ThemeProvider } = await server.ssrLoadModule('/src/context/ThemeContext.jsx');
    const html = renderToString(React.createElement(ThemeProvider, null, React.createElement(AccountantDashboard)));
    assert.match(html,/Accountant Dashboard/);
    assert.match(html,/Fees Collection/);
    assert.match(html,/Loading account summary/);
  } finally { await server.close(); }
});
