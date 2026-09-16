import apiRequest from './api';

const teachers = (path = '', options = {}) => apiRequest(`/teachers${path}`, options);

export const teacherService = {
  list: (params = '') => teachers(`?${params}`),
  search: (q) => teachers(`/search?q=${encodeURIComponent(q)}`),
  get: (id) => teachers(`/${id}`),
  create: (data) => teachers('', { method: 'POST', body: data }),
  update: (id, data) => teachers(`/${id}`, { method: 'PUT', body: data }),
  updateStatus: (id, status) => teachers(`/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' }),
  remove: (id) => teachers(`/${id}`, { method: 'DELETE' })
};