import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const teacherService = {
  list: (params = '') => {
    let queryParams = {};
    if (typeof params === 'string') {
      const parsed = new URLSearchParams(params);
      parsed.forEach((val, key) => { queryParams[key] = val; });
    } else if (typeof params === 'object') {
      queryParams = params;
    }
    return NetworkService.get(API_ENDPOINTS.TEACHERS.BASE, queryParams);
  },

  search: (q, page = 0, size = 50) => {
    return NetworkService.get(API_ENDPOINTS.TEACHERS.SEARCH, { q, page, size });
  },

  getByEmployeeId: (employeeId) => {
    return NetworkService.get(API_ENDPOINTS.TEACHERS.BY_EMPLOYEE(employeeId));
  },

  getByEmail: (email) => {
    return NetworkService.get(API_ENDPOINTS.TEACHERS.BY_EMAIL(email));
  },

  getByDepartment: (department, page = 0, size = 50) => {
    return NetworkService.get(API_ENDPOINTS.TEACHERS.BY_DEPARTMENT(department), { page, size });
  },

  get: (id) => {
    return NetworkService.get(API_ENDPOINTS.TEACHERS.BY_ID(id));
  },

  create: (data) => {
    return NetworkService.post(API_ENDPOINTS.TEACHERS.BASE, data);
  },

  update: (id, data) => {
    return NetworkService.put(API_ENDPOINTS.TEACHERS.BY_ID(id), data);
  },

  updateStatus: (id, status) => {
    return NetworkService.patch(API_ENDPOINTS.TEACHERS.STATUS(id), null, { params: { status } });
  },

  remove: (id) => {
    return NetworkService.delete(API_ENDPOINTS.TEACHERS.BY_ID(id));
  }
};

export default teacherService;