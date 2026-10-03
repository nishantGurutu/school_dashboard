import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const timetableService = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.className) query.append('className', params.className);
    if (params.section) query.append('section', params.section);
    if (params.day) query.append('day', params.day);
    if (params.teacherName) query.append('teacherName', params.teacherName);
    const qs = query.toString();
    const endpoint = qs ? `${API_ENDPOINTS.TIMETABLE.BASE}?${qs}` : API_ENDPOINTS.TIMETABLE.BASE;
    return NetworkService.get(endpoint);
  },

  get: (id) => NetworkService.get(API_ENDPOINTS.TIMETABLE.BY_ID(id)),

  create: (data) => NetworkService.post(API_ENDPOINTS.TIMETABLE.BASE, data),

  update: (id, data) => NetworkService.put(API_ENDPOINTS.TIMETABLE.BY_ID(id), data),

  delete: (id) => NetworkService.delete(API_ENDPOINTS.TIMETABLE.BY_ID(id)),

  getByClassAndSection: (className, section) =>
    NetworkService.get(API_ENDPOINTS.TIMETABLE.BY_CLASS_SECTION(className, section)),

  getByTeacher: (teacherName) =>
    NetworkService.get(API_ENDPOINTS.TIMETABLE.BY_TEACHER(teacherName))
};

export default timetableService;
