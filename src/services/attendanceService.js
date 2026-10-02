import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const attendanceService = {
  list: (typeOrQueryOrParams = '', date = '', className = '') => {
    if (typeof typeOrQueryOrParams === 'object' && typeOrQueryOrParams !== null) {
      return NetworkService.get(API_ENDPOINTS.ATTENDANCE.BASE, typeOrQueryOrParams);
    }
    if (typeof typeOrQueryOrParams === 'string' && typeOrQueryOrParams.includes('=')) {
      return NetworkService.get(`${API_ENDPOINTS.ATTENDANCE.BASE}?${typeOrQueryOrParams}`);
    }
    const params = {};
    if (typeOrQueryOrParams) params.type = typeOrQueryOrParams;
    if (date) params.date = date;
    if (className) params.className = className;
    return NetworkService.get(API_ENDPOINTS.ATTENDANCE.BASE, params);
  },

  create: (data) => NetworkService.post(API_ENDPOINTS.ATTENDANCE.BASE, data),

  update: (id, data) => NetworkService.put(API_ENDPOINTS.ATTENDANCE.BY_ID(id), data),

  delete: (id) => NetworkService.delete(API_ENDPOINTS.ATTENDANCE.BY_ID(id))
};

export default attendanceService;