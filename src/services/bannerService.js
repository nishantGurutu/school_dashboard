import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const bannerService = {
  list: () => NetworkService.get(API_ENDPOINTS.BANNERS.BASE),
  getActive: () => NetworkService.get(API_ENDPOINTS.BANNERS.ACTIVE),
  get: (id) => NetworkService.get(API_ENDPOINTS.BANNERS.BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.BANNERS.BASE, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.BANNERS.BY_ID(id), data),
  delete: (id) => NetworkService.delete(API_ENDPOINTS.BANNERS.BY_ID(id)),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.BANNERS.BY_ID(id))
};

export default bannerService;
