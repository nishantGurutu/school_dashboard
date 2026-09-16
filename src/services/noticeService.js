import apiRequest from './api';

export const noticeService = {
  list: () => apiRequest('/notices'),
  create: (data) => apiRequest('/notices', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/notices/${id}`, { method: 'PUT', body: data }),
  remove: (id) => apiRequest(`/notices/${id}`, { method: 'DELETE' })
};