import apiRequest from './api';

const base = '/classes';

export const classService = {
  sections: {
    list: () => apiRequest(`${base}/sections`),
    create: (data) => apiRequest(`${base}/sections`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/sections/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/sections/${id}`, { method: 'DELETE' })
  },
  subjects: {
    list: () => apiRequest(`${base}/subjects`),
    create: (data) => apiRequest(`${base}/subjects`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/subjects/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/subjects/${id}`, { method: 'DELETE' })
  },
  list: {
    list: () => apiRequest(`${base}/classes`),
    create: (data) => apiRequest(`${base}/classes`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/classes/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/classes/${id}`, { method: 'DELETE' })
  },
  rooms: {
    list: () => apiRequest(`${base}/rooms`),
    create: (data) => apiRequest(`${base}/rooms`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/rooms/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/rooms/${id}`, { method: 'DELETE' })
  }
};