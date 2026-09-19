import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';
import hrmService from './hrmService';

export const dashboardService = {
  getStats: async () => {
    const res = await NetworkService.get(API_ENDPOINTS.ADMIN_DASHBOARD.STATS);
    return res?.data || res;
  },
  stats: async () => {
    const res = await NetworkService.get(API_ENDPOINTS.ADMIN_DASHBOARD.STATS);
    return res?.data || res;
  },
  hrm: async () => {
    return hrmService.getSummary();
  }
};

export default dashboardService;