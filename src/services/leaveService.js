import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const leaveService = {
  // Direct methods
  listTypes: () => NetworkService.get(API_ENDPOINTS.LEAVES.TYPES),
  getType: (id) => NetworkService.get(API_ENDPOINTS.LEAVES.TYPE_BY_ID(id)),
  createType: (data) => NetworkService.post(API_ENDPOINTS.LEAVES.TYPES, data),
  updateType: (id, data) => NetworkService.put(API_ENDPOINTS.LEAVES.TYPE_BY_ID(id), data),
  deleteType: (id) => NetworkService.delete(API_ENDPOINTS.LEAVES.TYPE_BY_ID(id)),

  listRequests: () => NetworkService.get(API_ENDPOINTS.LEAVES.REQUESTS),
  getRequest: (id) => NetworkService.get(API_ENDPOINTS.LEAVES.REQUEST_BY_ID(id)),
  createRequest: (data) => NetworkService.post(API_ENDPOINTS.LEAVES.REQUESTS, data),
  updateRequest: (id, data) => NetworkService.put(API_ENDPOINTS.LEAVES.REQUEST_BY_ID(id), data),
  deleteRequest: (id) => NetworkService.delete(API_ENDPOINTS.LEAVES.REQUEST_BY_ID(id)),

  // Sub-namespaces for UI components compatibility
  types: {
    list: () => NetworkService.get(API_ENDPOINTS.LEAVES.TYPES),
    get: (id) => NetworkService.get(API_ENDPOINTS.LEAVES.TYPE_BY_ID(id)),
    create: (data) => NetworkService.post(API_ENDPOINTS.LEAVES.TYPES, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.LEAVES.TYPE_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.LEAVES.TYPE_BY_ID(id))
  },
  requests: {
    list: () => NetworkService.get(API_ENDPOINTS.LEAVES.REQUESTS),
    get: (id) => NetworkService.get(API_ENDPOINTS.LEAVES.REQUEST_BY_ID(id)),
    create: (data) => NetworkService.post(API_ENDPOINTS.LEAVES.REQUESTS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.LEAVES.REQUEST_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.LEAVES.REQUEST_BY_ID(id))
  }
};

export default leaveService;