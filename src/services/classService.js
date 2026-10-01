import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

const classesEndpoints = {
  list: () => NetworkService.get(API_ENDPOINTS.CLASSES.CLASSES),
  get: (id) => NetworkService.get(API_ENDPOINTS.CLASSES.CLASS_BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.CLASSES, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.CLASS_BY_ID(id), data),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.CLASS_BY_ID(id))
};

const sectionsEndpoints = {
  list: () => NetworkService.get(API_ENDPOINTS.CLASSES.SECTIONS),
  get: (id) => NetworkService.get(API_ENDPOINTS.CLASSES.SECTION_BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.SECTIONS, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.SECTION_BY_ID(id), data),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.SECTION_BY_ID(id))
};

const subjectsEndpoints = {
  list: () => NetworkService.get(API_ENDPOINTS.CLASSES.SUBJECTS),
  get: (id) => NetworkService.get(API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.SUBJECTS, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id), data),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.SUBJECT_BY_ID(id))
};

const roomsEndpoints = {
  list: () => NetworkService.get(API_ENDPOINTS.CLASSES.ROOMS),
  get: (id) => NetworkService.get(API_ENDPOINTS.CLASSES.ROOM_BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.CLASSES.ROOMS, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.CLASSES.ROOM_BY_ID(id), data),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.CLASSES.ROOM_BY_ID(id))
};

export const classService = {
  // Direct methods
  listClasses: classesEndpoints.list,
  getClass: classesEndpoints.get,
  createClass: classesEndpoints.create,
  updateClass: classesEndpoints.update,
  deleteClass: classesEndpoints.remove,

  listSections: sectionsEndpoints.list,
  getSection: sectionsEndpoints.get,
  createSection: sectionsEndpoints.create,
  updateSection: sectionsEndpoints.update,
  deleteSection: sectionsEndpoints.remove,

  listSubjects: subjectsEndpoints.list,
  getSubject: subjectsEndpoints.get,
  createSubject: subjectsEndpoints.create,
  updateSubject: subjectsEndpoints.update,
  deleteSubject: subjectsEndpoints.remove,

  listRooms: roomsEndpoints.list,
  getRoom: roomsEndpoints.get,
  createRoom: roomsEndpoints.create,
  updateRoom: roomsEndpoints.update,
  deleteRoom: roomsEndpoints.remove,

  // Sub-namespace objects for UI components compatibility
  classes: classesEndpoints,
  list: classesEndpoints, // Alias for backward compatibility
  sections: sectionsEndpoints,
  subjects: subjectsEndpoints,
  rooms: roomsEndpoints
};

export default classService;