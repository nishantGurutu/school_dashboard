import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const guardianService = {
  // List all guardians with pagination
  list: (params = '') => {
    let queryParams = {};
    if (typeof params === 'string') {
      const parsed = new URLSearchParams(params);
      parsed.forEach((val, key) => {
        queryParams[key] = val;
      });
    } else if (typeof params === 'object') {
      queryParams = params;
    }
    return NetworkService.get(API_ENDPOINTS.GUARDIANS.BASE, queryParams);
  },

  // Search guardians by name, phone, email or occupation
  search: (q, page = 0, size = 50) => {
    return NetworkService.get(API_ENDPOINTS.GUARDIANS.SEARCH, { q, page, size });
  },

  // Get guardian by email
  getByEmail: (email) => {
    return NetworkService.get(API_ENDPOINTS.GUARDIANS.BY_EMAIL(email));
  },

  // Get guardians of a student by admission number
  getByStudent: (admissionNo) => {
    return NetworkService.get(API_ENDPOINTS.GUARDIANS.BY_STUDENT(admissionNo));
  },

  // Get guardian by ID
  get: (id) => {
    return NetworkService.get(API_ENDPOINTS.GUARDIANS.BY_ID(id));
  },

  // Create new guardian
  create: (data) => {
    return NetworkService.post(API_ENDPOINTS.GUARDIANS.BASE, data);
  },

  // Update guardian by ID
  update: (id, data) => {
    return NetworkService.put(API_ENDPOINTS.GUARDIANS.BY_ID(id), data);
  },

  // Delete guardian by ID
  remove: (id) => {
    return NetworkService.delete(API_ENDPOINTS.GUARDIANS.BY_ID(id));
  }
};

export default guardianService;