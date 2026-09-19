import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const certificateService = {
  list: () => NetworkService.get(API_ENDPOINTS.CERTIFICATES.BASE),
  get: (id) => NetworkService.get(API_ENDPOINTS.CERTIFICATES.BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.CERTIFICATES.BASE, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.CERTIFICATES.BY_ID(id), data),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.CERTIFICATES.BY_ID(id))
};

export default certificateService;