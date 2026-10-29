export function mergeChatMessages(previous, incoming) {
  const key = message => message.clientId ? `${message.senderId}:${message.clientId}` : `id:${message.id}`;
  const merged = new Map(previous.map(message => [key(message), message]));
  incoming.forEach(message => merged.set(key(message), message));
  return [...merged.values()].sort((a, b) => {
    const x = Number(a.id), y = Number(b.id);
    if (Number.isFinite(x) && Number.isFinite(y)) return x - y;
    if (Number.isFinite(x) !== Number.isFinite(y)) return Number.isFinite(x) ? -1 : 1;
    return new Date(a.sentAt) - new Date(b.sentAt);
  });
}
