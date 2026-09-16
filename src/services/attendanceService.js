import apiRequest from './api';

export const attendanceService = {
  list: (params = '') => apiRequest(`/attendance?${params}`),
  create: (data) => apiRequest('/attendance', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/attendance/${id}`, { method: 'PUT', body: data }),
  remove: (id) => apiRequest(`/attendance/${id}`, { method: 'DELETE' })
};