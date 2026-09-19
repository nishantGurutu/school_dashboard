import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const feeService = {
  // Direct methods
  listCollections: () => NetworkService.get(API_ENDPOINTS.FEES.COLLECTIONS),
  createCollection: (data) => NetworkService.post(API_ENDPOINTS.FEES.COLLECTIONS, data),
  updateCollection: (id, data) => NetworkService.put(API_ENDPOINTS.FEES.COLLECTION_BY_ID(id), data),
  deleteCollection: (id) => NetworkService.delete(API_ENDPOINTS.FEES.COLLECTION_BY_ID(id)),

  listTypes: () => NetworkService.get(API_ENDPOINTS.FEES.TYPES),
  createType: (data) => NetworkService.post(API_ENDPOINTS.FEES.TYPES, data),
  updateType: (id, data) => NetworkService.put(API_ENDPOINTS.FEES.TYPE_BY_ID(id), data),
  deleteType: (id) => NetworkService.delete(API_ENDPOINTS.FEES.TYPE_BY_ID(id)),

  listGroups: () => NetworkService.get(API_ENDPOINTS.FEES.GROUPS),
  createGroup: (data) => NetworkService.post(API_ENDPOINTS.FEES.GROUPS, data),
  updateGroup: (id, data) => NetworkService.put(API_ENDPOINTS.FEES.GROUP_BY_ID(id), data),
  deleteGroup: (id) => NetworkService.delete(API_ENDPOINTS.FEES.GROUP_BY_ID(id)),

  listDiscounts: () => NetworkService.get(API_ENDPOINTS.FEES.DISCOUNTS),
  createDiscount: (data) => NetworkService.post(API_ENDPOINTS.FEES.DISCOUNTS, data),
  updateDiscount: (id, data) => NetworkService.put(API_ENDPOINTS.FEES.DISCOUNT_BY_ID(id), data),
  deleteDiscount: (id) => NetworkService.delete(API_ENDPOINTS.FEES.DISCOUNT_BY_ID(id)),

  // Sub-namespace objects for backward compatibility with UI components
  collections: {
    list: () => NetworkService.get(API_ENDPOINTS.FEES.COLLECTIONS),
    create: (data) => NetworkService.post(API_ENDPOINTS.FEES.COLLECTIONS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.FEES.COLLECTION_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.FEES.COLLECTION_BY_ID(id))
  },
  types: {
    list: () => NetworkService.get(API_ENDPOINTS.FEES.TYPES),
    create: (data) => NetworkService.post(API_ENDPOINTS.FEES.TYPES, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.FEES.TYPE_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.FEES.TYPE_BY_ID(id))
  },
  groups: {
    list: () => NetworkService.get(API_ENDPOINTS.FEES.GROUPS),
    create: (data) => NetworkService.post(API_ENDPOINTS.FEES.GROUPS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.FEES.GROUP_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.FEES.GROUP_BY_ID(id))
  },
  discounts: {
    list: () => NetworkService.get(API_ENDPOINTS.FEES.DISCOUNTS),
    create: (data) => NetworkService.post(API_ENDPOINTS.FEES.DISCOUNTS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.FEES.DISCOUNT_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.FEES.DISCOUNT_BY_ID(id))
  }
};

export default feeService;