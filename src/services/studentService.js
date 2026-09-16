import apiRequest from './api';

const students = (path = '', options = {}) => apiRequest(`/students${path}`, options);

export const studentService = {
  list: (params = '') => students(`?${params}`),
  search: (q) => students(`/search?q=${encodeURIComponent(q)}`),
  byClass: (className) => students(`/class/${encodeURIComponent(className)}`),
  byAdmission: (admissionNo) => students(`/admission/${encodeURIComponent(admissionNo)}`),
  get: (id) => students(`/${id}`),
  create: (data) => students('', { method: 'POST', body: data }),
  update: (id, data) => students(`/${id}`, { method: 'PUT', body: data }),
  updateStatus: (id, status) => students(`/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' }),
  remove: (id) => students(`/${id}`, { method: 'DELETE' })
};