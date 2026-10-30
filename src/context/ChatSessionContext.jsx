import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { mergeChatMessages } from '../services/chatMessages';
import { NetworkService } from '../services/api';
import { API_BASE_URL } from '../services/apiConfig';

const ChatSession = createContext(null);
export const useChatSession = () => useContext(ChatSession);

// Mounted once for the authenticated app, independently of the active module.
export function ChatSessionProvider({ children }) {
  const [rooms, setRooms] = useState([]), [contacts, setContacts] = useState([]);
  const [roomId, setRoomId] = useState(null), [messages, updateMessages] = useState([]);
  const [error, setError] = useState(''), [online, setOnline] = useState(false);
  const cursor = useRef(0), selectedRoom = useRef(null), syncing = useRef(false), visible = useRef(false), history = useRef(new Map()), cursors = useRef(new Map()), rerun = useRef(false), active = useRef(true);
  const setMessages = useCallback(next => {
    const current = selectedRoom.current;
    updateMessages(previous => {
      if (selectedRoom.current !== current) return previous;
      const value = typeof next === 'function' ? next(previous) : next;
      if (current) history.current.set(current, value);
      return value;
    });
  }, []);
  const sync = useCallback(async () => {
    if (!active.current) return;
    if (syncing.current) { rerun.current = true; return; }
    syncing.current = true;
    try {
      const nextRooms = await NetworkService.get('/chat/rooms');
      if (!active.current) return;
      setRooms(nextRooms);
      const current = selectedRoom.current;
      if (!current) return;
      let after = cursor.current, more = true;
      while (more && selectedRoom.current === current) {
        const page = await NetworkService.get(`/chat/rooms/${current}/messages`, { after });
        if (!active.current || selectedRoom.current !== current) return;
        setMessages(previous => {
          const merged = mergeChatMessages(previous, page.messages);
          history.current.set(current, merged);
          return merged;
        });
        more = page.hasMore;
        if (page.messages.length) after = page.messages.at(-1).id; else more = false;
      }
      if (!active.current || selectedRoom.current !== current) return;
      cursor.current = after;
      cursors.current.set(current, after);
      if (after) await NetworkService.post(`/chat/rooms/${current}/receipts`, { through: after, read: visible.current && !document.hidden });
    } catch (e) { if (active.current) setError(e.message); } finally { syncing.current = false; if (rerun.current) { rerun.current = false; void sync(); } }
  }, [setMessages]);
  useEffect(() => {
    selectedRoom.current = roomId;
    cursor.current = cursors.current.get(roomId) || 0;
    updateMessages(history.current.get(roomId) || []);
    void sync();
  }, [roomId, sync]);
  useEffect(() => {
    active.current = true;
    let disposed = false, socket, base, online = false;
    async function connect() {
      try {
        if (disposed) return;
        base = API_BASE_URL;
        const client = new Client({ brokerURL: base.replace(/^http/, 'ws') + '/chat/ws', reconnectDelay: 5000,
          heartbeatIncoming: 10000, heartbeatOutgoing: 10000,
          beforeConnect: async () => {
            try {
              const token = await NetworkService.socketAccessToken();
              if (disposed || socket !== client) { void client.deactivate(); return; }
              base = API_BASE_URL;
              client.brokerURL = base.replace(/^http/, 'ws') + '/chat/ws';
              client.connectHeaders = { Authorization: `Bearer ${token}` };
            } catch (e) {
              if (!disposed && socket === client) setError(e.message);
              void client.deactivate();
            }
          },
          onConnect: () => { if (disposed || socket !== client) return; online = true; setOnline(true); client.subscribe('/user/queue/chat', frame => {
            if (disposed || socket !== client) return;
            const event = JSON.parse(frame.body);
            if (event.type === 'message' && event.message) {
              if (event.roomId === selectedRoom.current) setMessages(previous => mergeChatMessages(previous, [event.message]));
              setRooms(previous => previous.map(r => r.id === event.roomId ? { ...r, lastMessage: event.message.text || 'Attachment' } : r));
            }
            if (event.type === 'receipt') {
              setRooms(previous => previous.map(r => r.id === event.roomId ? { ...r, members: r.members.map(m => String(m.id) === String(event.userId) ? { ...m, readThrough: Math.max(m.readThrough || 0, event.readThrough || 0), deliveredThrough: Math.max(m.deliveredThrough || 0, event.deliveredThrough || 0) } : m) } : r));
            } else sync();
          }); sync(); },
          onWebSocketClose: () => { if (socket !== client) return; online = false; if (!disposed) setOnline(false); }, onStompError: () => { if (socket !== client) return; online = false; if (!disposed) setOnline(false); client.forceDisconnect(); }
        }); socket = client; client.activate();
      } catch (e) { if (!disposed) setError(e.message); }
    }
    connect();
    NetworkService.get('/chat/contacts').then(result => { if (!disposed) setContacts(result); }).catch(e => { if (!disposed) setError(e.message); });
    const timer = setInterval(() => { if (!online) sync(); if (!socket?.active || (base && base !== API_BASE_URL)) { socket?.deactivate(); connect(); } }, 5000);
    const reauth = setInterval(() => { socket?.deactivate().then(connect); }, 20 * 60 * 1000);
    document.addEventListener('visibilitychange', sync);
    return () => { disposed = true; active.current = false; clearInterval(timer); clearInterval(reauth); socket?.deactivate(); document.removeEventListener('visibilitychange', sync); };
  }, [sync, setMessages]);
  return <ChatSession.Provider value={{ rooms, contacts, roomId, setRoomId, messages, setMessages, error, setError, online, selectedRoom, sync, visible }}>{children}</ChatSession.Provider>;
}
