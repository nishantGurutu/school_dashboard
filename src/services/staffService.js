import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const staffService = {
  availableBuses: async () => {
    const buses = await NetworkService.get(`${API_ENDPOINTS.STAFF.BASE}/available-buses`, { _: Date.now() }, { cache: 'no-store' });
    if (!Array.isArray(buses)) throw new Error('Could not verify bus availability.');
    if (buses.some(bus => !bus.assignmentStatus || typeof bus.availableForAssignment !== 'boolean')) {
      throw new Error('Bus availability API needs the updated backend. Please restart or deploy the backend.');
    }
    return buses.filter(bus => bus.assignmentStatus === 'AVAILABLE' && bus.availableForAssignment === true && bus.status === 'ACTIVE');
  },
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
