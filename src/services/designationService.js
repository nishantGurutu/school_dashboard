import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const designationService = {
  list: async () => {
    const res = await NetworkService.get(API_ENDPOINTS.DESIGNATIONS.BASE);
    return Array.isArray(res) ? res : (res?.data || res?.content || []);
  },

  get: async (id) => {
    const res = await NetworkService.get(API_ENDPOINTS.DESIGNATIONS.BY_ID(id));
    return res?.data || res;
  },

  create: async (data) => {
    const res = await NetworkService.post(API_ENDPOINTS.DESIGNATIONS.BASE, data);
    return res?.data || res;
  },

  update: async (id, data) => {
    const res = await NetworkService.put(API_ENDPOINTS.DESIGNATIONS.BY_ID(id), data);
    return res?.data || res;
  },

  remove: async (id) => {
    return NetworkService.delete(API_ENDPOINTS.DESIGNATIONS.BY_ID(id));
  }
};

export default designationService;
