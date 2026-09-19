import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const noticeService = {
  list: () => NetworkService.get(API_ENDPOINTS.NOTICES.BASE),
  get: (id) => NetworkService.get(API_ENDPOINTS.NOTICES.BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.NOTICES.BASE, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.NOTICES.BY_ID(id), data),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.NOTICES.BY_ID(id))
};

export default noticeService;