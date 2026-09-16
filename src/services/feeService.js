import apiRequest from './api';

const base = '/fees';

export const feeService = {
  types: {
    list: () => apiRequest(`${base}/types`),
    create: (data) => apiRequest(`${base}/types`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/types/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/types/${id}`, { method: 'DELETE' })
  },
  groups: {
    list: () => apiRequest(`${base}/groups`),
    create: (data) => apiRequest(`${base}/groups`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/groups/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/groups/${id}`, { method: 'DELETE' })
  },
  discounts: {
    list: () => apiRequest(`${base}/discounts`),
    create: (data) => apiRequest(`${base}/discounts`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/discounts/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/discounts/${id}`, { method: 'DELETE' })
  },
  collections: {
    list: () => apiRequest(`${base}/collections`),
    create: (data) => apiRequest(`${base}/collections`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/collections/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/collections/${id}`, { method: 'DELETE' })
  }
};