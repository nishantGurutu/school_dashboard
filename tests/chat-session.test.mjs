import { test } from 'node:test';
import assert from 'node:assert/strict';
import React, { useEffect } from 'react';
import { create, act } from 'react-test-renderer';
import { createServer } from 'vite';
import { Client } from '@stomp/stompjs';

test('app session keeps one socket and cached messages across chat screen navigation, closes on logout', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  let root;
  const original = { activate: Client.prototype.activate, deactivate: Client.prototype.deactivate, subscribe: Client.prototype.subscribe };
  try {
    const listeners = new Map();
    globalThis.document = { hidden: false, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
    globalThis.localStorage = { getItem: () => null };
    const { NetworkService } = await server.ssrLoadModule('/src/services/api.js');
    let opens = 0, closes = 0, session, receive;
    const receipts = [];
    NetworkService.socketAccessToken = async () => 'token';
    NetworkService.get = async path => path === '/chat/rooms' ? [{id:'room', members:[]}] : path === '/chat/contacts' ? [] : {messages:[{id:1, senderId:2, text:'cached'}], hasMore:false};
    NetworkService.post = async (path, data) => { receipts.push(data); return {}; };
    Client.prototype.activate = function () { opens++; this.onConnect({}); };
    Client.prototype.deactivate = async function () { closes++; };
    Client.prototype.subscribe = function (_, callback) { receive = callback; return {unsubscribe(){}}; };
    const { ChatSessionProvider, useChatSession } = await server.ssrLoadModule('/src/context/ChatSessionContext.jsx');
    function Screen() {
      session = useChatSession();
      useEffect(() => { session.visible.current = true; return () => { session.visible.current = false; }; }, []);
      return React.createElement('div', null, session.messages.map(message => message.text).join(','));
    }
    const app = visible => React.createElement(ChatSessionProvider, null, visible ? React.createElement(Screen) : null);
    await act(async () => { root = create(app(true)); });
    await act(async () => { session.setRoomId('room'); });
    assert.match(root.toJSON().children.join(''), /cached/);
    await act(async () => { root.update(app(false)); });
    assert.equal(session.visible.current, false);
    assert.equal(closes, 0);
    await act(async () => {
      receive({body:JSON.stringify({type:'message',roomId:'room',message:{id:2,senderId:2,text:'while away'}})});
    });
    assert.equal(receipts.at(-1).read, false);
    await act(async () => { root.update(app(true)); });
    assert.equal(opens, 1);
    assert.match(root.toJSON().children.join(''), /while away/);
    await act(async () => { root.unmount(); root = null; });
    assert.equal(closes, 1);
    assert.equal(listeners.size, 0);
  } finally {
    if (root) await act(async () => root.unmount());
    Object.assign(Client.prototype, original);
    await server.close();
  }
});
