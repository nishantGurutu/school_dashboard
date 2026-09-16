import apiRequest from './api';

const base = '/exams';

export const examService = {
  exams: {
    list: () => apiRequest(`${base}/exams`),
    create: (data) => apiRequest(`${base}/exams`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/exams/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/exams/${id}`, { method: 'DELETE' })
  },
  schedules: {
    list: () => apiRequest(`${base}/schedules`),
    create: (data) => apiRequest(`${base}/schedules`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/schedules/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/schedules/${id}`, { method: 'DELETE' })
  },
  results: {
    list: () => apiRequest(`${base}/results`),
    create: (data) => apiRequest(`${base}/results`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`${base}/results/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`${base}/results/${id}`, { method: 'DELETE' })
  }
};