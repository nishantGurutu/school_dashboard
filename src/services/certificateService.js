import apiRequest from './api';

export const certificateService = {
  list: () => apiRequest('/certificates'),
  create: (data) => apiRequest('/certificates', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/certificates/${id}`, { method: 'PUT', body: data }),
  remove: (id) => apiRequest(`/certificates/${id}`, { method: 'DELETE' })
};