import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const hrmService = {
  getSummary: async () => {
    const res = await NetworkService.get(API_ENDPOINTS.HRM.SUMMARY);
    return res?.data || res;
  }
};

export default hrmService;
