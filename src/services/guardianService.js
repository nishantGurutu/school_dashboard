import apiRequest from './api';

const guardians = (path = '', options = {}) => apiRequest(`/guardians${path}`, options);

export const guardianService = {
  list: (params = '') => guardians(`?${params}`),
  search: (q) => guardians(`/search?q=${encodeURIComponent(q)}`),
  get: (id) => guardians(`/${id}`),
  create: (data) => guardians('', { method: 'POST', body: data }),
  update: (id, data) => guardians(`/${id}`, { method: 'PUT', body: data }),
  remove: (id) => guardians(`/${id}`, { method: 'DELETE' })
};