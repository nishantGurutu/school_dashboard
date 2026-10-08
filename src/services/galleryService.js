import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const galleryService = {
  list: () => NetworkService.get(API_ENDPOINTS.GALLERY.BASE),
  getActive: () => NetworkService.get(API_ENDPOINTS.GALLERY.ACTIVE),
  get: (id) => NetworkService.get(API_ENDPOINTS.GALLERY.BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.GALLERY.BASE, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.GALLERY.BY_ID(id), data),
  delete: (id) => NetworkService.delete(API_ENDPOINTS.GALLERY.BY_ID(id)),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.GALLERY.BY_ID(id))
};

export default galleryService;
