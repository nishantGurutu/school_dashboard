import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const staffService = {
  list: (params = '') => {
    let queryParams = {};
    if (typeof params === 'string') {
      const parsed = new URLSearchParams(params);
      parsed.forEach((val, key) => { queryParams[key] = val; });
    } else if (typeof params === 'object') {
      queryParams = params;
    }
    return NetworkService.get(API_ENDPOINTS.STAFF.BASE, queryParams);
  },

  get: (id) => {
    return NetworkService.get(API_ENDPOINTS.STAFF.BY_ID(id));
  },

  create: (data) => {
    return NetworkService.post(API_ENDPOINTS.STAFF.BASE, data);
  },

  update: (id, data) => {
    return NetworkService.put(API_ENDPOINTS.STAFF.BY_ID(id), data);
  },

  remove: (id) => {
    return NetworkService.delete(API_ENDPOINTS.STAFF.BY_ID(id));
  }
};

export default staffService;
