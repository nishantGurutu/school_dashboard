import { mergeChatMessages } from '../../services/chatMessages';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useChatSession } from '../../context/ChatSessionContext';
import { NetworkService, authStorage } from '../../services/api';
import './ChatModule.css';

export function ChatModule() {
  const { rooms, contacts, roomId, setRoomId, messages, setMessages, error, setError, online, selectedRoom, sync, visible } = useChatSession();
  const [text, setText] = useState(''), [attachment, setAttachment] = useState(null);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false), [group, setGroup] = useState(false), [name, setName] = useState(''), [selected, setSelected] = useState([]);
  const messageList = useRef(null), followBottom = useRef(true), draft = useRef(null);
  const userId = authStorage.getUser()?.userId;
  const room = rooms.find(r => r.id === roomId);
  useEffect(() => {
    visible.current = true;
    void sync();
    return () => { visible.current = false; };
  }, [sync, visible]);
  useEffect(() => { followBottom.current = true; setAttachment(null); draft.current = null; }, [roomId]);
  useLayoutEffect(() => {
    const list = messageList.current;
    if (list && followBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages, roomId, room?.id]);
  async function create(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await NetworkService.post('/chat/rooms', { name, groupChat: group, memberIds: selected }); setCreating(false); setSelected([]); setRoomId(result.id); await sync(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function send(event, retry) {
    event?.preventDefault();
    const current = retry?.roomId || roomId;
    if (!current || (!retry && ((!text.trim() && !attachment) || busy))) return;
    const message = retry || { id: `local-${crypto.randomUUID()}`, roomId: current, clientId: crypto.randomUUID(), senderId: userId, senderName: authStorage.getUser()?.name || 'You', text, sentAt: new Date().toISOString(), attachment, localState: 'sending' };
    followBottom.current = true;
    if (!retry) { setText(''); setAttachment(null); }
    setError('');
    if (selectedRoom.current === current) setMessages(previous => mergeChatMessages(previous, [{ ...message, localState: 'sending' }]));
    try {
      const saved = await NetworkService.post(`/chat/rooms/${current}/messages`, { text: message.text, attachmentId: message.attachment?.id, clientId: message.clientId });
      if (selectedRoom.current === current) setMessages(previous => mergeChatMessages(previous, [saved]));
    } catch (e) {
      if (selectedRoom.current === current) setMessages(previous => previous.map(m => m.clientId === message.clientId && String(m.id).startsWith('local-') ? { ...m, localState: 'failed' } : m));
      setError(e.message);
    }
  }
  async function upload(file) {
    if (!file) return; if (file.size > 10 * 1024 * 1024) { setError('Maximum attachment size is 10 MB.'); return; }
    setBusy(true); setError('');
    try { const body = new FormData(); body.append('file', file); setAttachment(await NetworkService.post(`/chat/rooms/${roomId}/attachments`, body)); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function download(file) {
    try { const blob = await NetworkService.get(`/chat/attachments/${file.id}`, null, { responseType: 'blob' });
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) { setError(e.message); }
  }
  function status(m) { if (m.localState === 'sending') return 'Sending'; if (m.localState === 'failed') return 'Failed'; const peers = room?.members.filter(p => String(p.id) !== String(m.senderId)) || []; return peers.length && peers.every(p => p.readThrough >= m.id) ? 'Read' : peers.length && peers.every(p => p.deliveredThrough >= m.id) ? 'Delivered' : 'Sent'; }
  const role = String(authStorage.getUser()?.role || '').replace('ROLE_', '');
  return <section className="school-chat">
    <header><div><h2>School messages</h2><small>{online ? 'Connected' : 'Reconnecting · periodic sync active'}</small></div><button onClick={() => { setCreating(!creating); setError(''); }}>New conversation</button></header>
    {error && <p role="alert" className="chat-error">{error} <button onClick={() => { setError(''); sync(); }}>Retry</button></p>}
    {creating && <form className="chat-create" onSubmit={create}>
      {['ADMIN','MASTER_ADMIN','SUPER_ADMIN','PRINCIPAL','TEACHER'].includes(role) && <label><input type="checkbox" checked={group} onChange={e => { setGroup(e.target.checked); setSelected([]); }} /> Group conversation</label>}
      {group && <input required maxLength={120} placeholder="Group name" value={name} onChange={e => setName(e.target.value)} />}
      <select required multiple={group} value={group ? selected.map(String) : String(selected[0] || '')} onChange={e => setSelected([...e.target.selectedOptions].map(o => Number(o.value)))}>
        {!group && <option value="">Choose a contact</option>}{contacts.map(c => <option key={c.id} value={c.id}>{c.name} · {c.role}</option>)}
      </select><button disabled={busy}>Start conversation</button>
    </form>}
    <div className="chat-columns"><aside aria-label="Conversations">{rooms.length === 0 && <p>No conversations yet. Start one with an authorized contact.</p>}{rooms.map(r => <button key={r.id} disabled={busy} className={r.id === roomId ? 'selected' : ''} onClick={() => setRoomId(r.id)}><strong>{r.groupChat ? '👥 ' : ''}{r.name}</strong>{r.unreadCount > 0 && <b>{r.unreadCount}</b>}<small>{r.lastMessage || 'No messages yet'}</small></button>)}</aside>
    <main>{!room ? <div className="chat-empty">Select a conversation to start messaging.</div> : <>
      <h3>{room.name}<small>{room.members.map(m => m.name).join(', ')}</small></h3>
      <div className="chat-messages" ref={messageList} onScroll={e => { const list = e.currentTarget; followBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80; }}>{messages.map(m => <article key={m.id} className={String(m.senderId) === String(userId) ? 'mine' : ''}><strong>{m.senderName}</strong><p>{m.text}</p>{m.localState === 'failed' && <button onClick={() => send(null, m)}>Retry send</button>}{m.attachment && <button onClick={() => download(m.attachment)}>📎 {m.attachment.name}</button>}<small>{new Date(m.sentAt).toLocaleString()}{String(m.senderId) === String(userId) && ` · ${status(m)}`}</small></article>)}</div>
      <form className="chat-compose" onSubmit={send}>{attachment && <span>📎 {attachment.name}<button type="button" onClick={() => setAttachment(null)}>Remove</button></span>}<textarea aria-label="Message" maxLength={4000} value={text} onChange={e => setText(e.target.value)} placeholder="Write a message…" /><label className="chat-attach">Attach image/PDF<input type="file" hidden accept="image/png,image/jpeg,image/webp,application/pdf" disabled={busy} onChange={e => { upload(e.target.files[0]); e.target.value = ''; }} /></label><button disabled={busy || (!text.trim() && !attachment)}>{busy ? 'Working…' : 'Send'}</button></form>
    </>}</main></div>
  </section>;
}
