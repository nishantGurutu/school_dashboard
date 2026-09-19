import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const studentService = {
  // List all students with pagination
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
    return NetworkService.get(API_ENDPOINTS.STUDENTS.BASE, queryParams);
  },

  // Search students by name, admission number, roll number, email or class
  search: (q, page = 0, size = 50) => {
    return NetworkService.get(API_ENDPOINTS.STUDENTS.SEARCH, { q, page, size });
  },

  // Get students by class name
  byClass: (className, page = 0, size = 50) => {
    return NetworkService.get(API_ENDPOINTS.STUDENTS.BY_CLASS(className), { page, size });
  },

  // Get student by admission number
  byAdmission: (admissionNo) => {
    return NetworkService.get(API_ENDPOINTS.STUDENTS.BY_ADMISSION(admissionNo));
  },

  // Get student by ID
  get: (id) => {
    return NetworkService.get(API_ENDPOINTS.STUDENTS.BY_ID(id));
  },

  // Create new student
  create: (data) => {
    return NetworkService.post(API_ENDPOINTS.STUDENTS.BASE, data);
  },

  // Update student by ID
  update: (id, data) => {
    return NetworkService.put(API_ENDPOINTS.STUDENTS.BY_ID(id), data);
  },

  // Update student status (e.g. Active, Inactive)
  updateStatus: (id, status) => {
    return NetworkService.patch(API_ENDPOINTS.STUDENTS.STATUS(id), null, {
      params: { status }
    });
  },

  // Delete student by ID
  remove: (id) => {
    return NetworkService.delete(API_ENDPOINTS.STUDENTS.BY_ID(id));
  }
};

export default studentService;