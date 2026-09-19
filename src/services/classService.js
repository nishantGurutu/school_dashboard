import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const classService = {
  // Direct methods
  listClasses: () => NetworkService.get(API_ENDPOINTS.CLASSES.CLASSES),
  createClass: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.CLASSES, data),
  updateClass: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.CLASS_BY_ID(id), data),
  deleteClass: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.CLASS_BY_ID(id)),

  listSections: () => NetworkService.get(API_ENDPOINTS.CLASSES.SECTIONS),
  createSection: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.SECTIONS, data),
  updateSection: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.SECTION_BY_ID(id), data),
  deleteSection: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.SECTION_BY_ID(id)),

  listSubjects: () => NetworkService.get(API_ENDPOINTS.CLASSES.SUBJECTS),
  createSubject: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.SUBJECTS, data),
  updateSubject: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id), data),
  deleteSubject: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id)),

  listRooms: () => NetworkService.get(API_ENDPOINTS.CLASSES.ROOMS),
  createRoom: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.ROOMS, data),
  updateRoom: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.ROOM_BY_ID(id), data),
  deleteRoom: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.ROOM_BY_ID(id)),

  // Sub-namespace objects for UI components compatibility
  classes: {
    list: () => NetworkService.get(API_ENDPOINTS.CLASSES.CLASSES),
    create: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.CLASSES, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.CLASS_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.CLASS_BY_ID(id))
  },
  sections: {
    list: () => NetworkService.get(API_ENDPOINTS.CLASSES.SECTIONS),
    create: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.SECTIONS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.SECTION_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.SECTION_BY_ID(id))
  },
  subjects: {
    list: () => NetworkService.get(API_ENDPOINTS.CLASSES.SUBJECTS),
    create: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.SUBJECTS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id))
  },
  rooms: {
    list: () => NetworkService.get(API_ENDPOINTS.CLASSES.ROOMS),
    create: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.ROOMS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.ROOM_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.ROOM_BY_ID(id))
  }
};

export default classService;