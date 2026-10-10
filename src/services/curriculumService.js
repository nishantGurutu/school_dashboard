import NetworkService from './networkService';

export const curriculumService = {
  // Teacher assigned subjects (optionally filtered by class)
  getSubjects: (className) =>
    NetworkService.get('/teacher/curriculum/subjects', {
      params: className && className !== 'All' ? { className } : {}
    }),

  createSubject: (data) => NetworkService.post('/teacher/curriculum/subjects', data),

  // Chapters & Topics tree
  getChapters: (subjectId, className) =>
    NetworkService.get('/teacher/curriculum/chapters', {
      params: { subjectId, ...(className ? { className } : {}) }
    }),

  // Chapter operations
  createChapter: (data) => NetworkService.post('/teacher/curriculum/chapters', data),
  updateChapter: (id, data) => NetworkService.put(`/teacher/curriculum/chapters/${id}`, data),
  deleteChapter: (id) => NetworkService.delete(`/teacher/curriculum/chapters/${id}`),

  // Topic operations
  createTopic: (data) => NetworkService.post('/teacher/curriculum/topics', data),
  updateTopic: (id, data) => NetworkService.put(`/teacher/curriculum/topics/${id}`, data),
  deleteTopic: (id) => NetworkService.delete(`/teacher/curriculum/topics/${id}`),

  // Notes operations
  uploadNote: (formData) => NetworkService.post('/teacher/curriculum/notes', formData),
  addNoteJson: (data) => NetworkService.post('/teacher/curriculum/notes/json', data),
  deleteNote: (id) => NetworkService.delete(`/teacher/curriculum/notes/${id}`)
};
