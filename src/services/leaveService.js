import apiRequest from './api';

const base = '/leaves';

export const leaveService = {
  types: {
    list: () => apiRequest(`${base}/types`),
    create: (data) => apiRequest(`${base}/types`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/types/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/types/${id}`, { method: 'DELETE' })
  },
  requests: {
    list: () => apiRequest(`${base}/requests`),
    create: (data) => apiRequest(`${base}/requests`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/requests/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/requests/${id}`, { method: 'DELETE' })
  }
};