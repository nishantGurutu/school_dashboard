import apiRequest from './api';

const base = '/library';

export const libraryService = {
  books: {
    list: () => apiRequest(`${base}/books`),
    create: (data) => apiRequest(`${base}/books`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/books/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/books/${id}`, { method: 'DELETE' })
  },
  members: {
    list: () => apiRequest(`${base}/members`),
    create: (data) => apiRequest(`${base}/members`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/members/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/members/${id}`, { method: 'DELETE' })
  },
  issues: {
    list: () => apiRequest(`${base}/issues`),
    create: (data) => apiRequest(`${base}/issues`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/issues/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/issues/${id}`, { method: 'DELETE' })
  }
};