const BASE = '/api';
async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
export const api = {
  getTodoist: () => req('/tasks/todoist'),
  getTelemann: () => req('/tasks/telemann'),
  getBayard: () => req('/tasks/bayard'),
  updateTodoist: (id, data) => req(`/tasks/todoist/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateTelemann: (id, data) => req(`/tasks/telemann/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateBayard: (id, data) => req(`/tasks/bayard/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getEmails: () => req('/emails'),
  markRead: (id) => req(`/emails/${id}/read`, { method: 'POST' }),
  archiveEmail: (id) => req(`/emails/${id}/archive`, { method: 'POST' }),
  replyEmail: (id, body) => req(`/emails/${id}/reply`, { method: 'POST', body: JSON.stringify({ body }) }),
  aiReplyEmail: (id) => req(`/emails/${id}/ai-reply`, { method: 'POST' }),
  sync: () => req('/sync', { method: 'POST' }),
  lastSync: () => req('/sync/last'),
};
