import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const subjectService = {
  list: () => NetworkService.get(API_ENDPOINTS.SUBJECTS ? API_ENDPOINTS.SUBJECTS.BASE : API_ENDPOINTS.CLASSES.SUBJECTS),
  get: (id) => NetworkService.get(API_ENDPOINTS.SUBJECTS ? API_ENDPOINTS.SUBJECTS.BY_ID(id) : API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.SUBJECTS ? API_ENDPOINTS.SUBJECTS.BASE : API_ENDPOINTS.CLASSES.SUBJECTS, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.SUBJECTS ? API_ENDPOINTS.SUBJECTS.BY_ID(id) : API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id), data),
  delete: (id) => NetworkService.delete(API_ENDPOINTS.SUBJECTS ? API_ENDPOINTS.SUBJECTS.BY_ID(id) : API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id)),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.SUBJECTS ? API_ENDPOINTS.SUBJECTS.BY_ID(id) : API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id))
};

export default subjectService;
