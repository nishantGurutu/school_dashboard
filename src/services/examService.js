import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const examService = {
  // Direct methods
  listExams: () => NetworkService.get(API_ENDPOINTS.EXAMS.EXAMS),
  createExam: (data) => NetworkService.post(API_ENDPOINTS.EXAMS.EXAMS, data),
  updateExam: (id, data) => NetworkService.put(API_ENDPOINTS.EXAMS.EXAM_BY_ID(id), data),
  deleteExam: (id) => NetworkService.delete(API_ENDPOINTS.EXAMS.EXAM_BY_ID(id)),

  listSchedules: () => NetworkService.get(API_ENDPOINTS.EXAMS.SCHEDULES),
  createSchedule: (data) => NetworkService.post(API_ENDPOINTS.EXAMS.SCHEDULES, data),
  updateSchedule: (id, data) => NetworkService.put(API_ENDPOINTS.EXAMS.SCHEDULE_BY_ID(id), data),
  deleteSchedule: (id) => NetworkService.delete(API_ENDPOINTS.EXAMS.SCHEDULE_BY_ID(id)),

  listResults: () => NetworkService.get(API_ENDPOINTS.EXAMS.RESULTS),
  createResult: (data) => NetworkService.post(API_ENDPOINTS.EXAMS.RESULTS, data),
  updateResult: (id, data) => NetworkService.put(API_ENDPOINTS.EXAMS.RESULT_BY_ID(id), data),
  deleteResult: (id) => NetworkService.delete(API_ENDPOINTS.EXAMS.RESULT_BY_ID(id)),

  // Sub-namespaces for UI components compatibility
  exams: {
    list: () => NetworkService.get(API_ENDPOINTS.EXAMS.EXAMS),
    create: (data) => NetworkService.post(API_ENDPOINTS.EXAMS.EXAMS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.EXAMS.EXAM_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.EXAMS.EXAM_BY_ID(id))
  },
  schedules: {
    list: () => NetworkService.get(API_ENDPOINTS.EXAMS.SCHEDULES),
    create: (data) => NetworkService.post(API_ENDPOINTS.EXAMS.SCHEDULES, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.EXAMS.SCHEDULE_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.EXAMS.SCHEDULE_BY_ID(id))
  },
  results: {
    list: () => NetworkService.get(API_ENDPOINTS.EXAMS.RESULTS),
    create: (data) => NetworkService.post(API_ENDPOINTS.EXAMS.RESULTS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.EXAMS.RESULT_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.EXAMS.RESULT_BY_ID(id))
  }
};

export default examService;