import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const libraryService = {
  // Direct methods
  listBooks: () => NetworkService.get(API_ENDPOINTS.LIBRARY.BOOKS),
  getBook: (id) => NetworkService.get(API_ENDPOINTS.LIBRARY.BOOK_BY_ID(id)),
  createBook: (data) => NetworkService.post(API_ENDPOINTS.LIBRARY.BOOKS, data),
  updateBook: (id, data) => NetworkService.put(API_ENDPOINTS.LIBRARY.BOOK_BY_ID(id), data),
  deleteBook: (id) => NetworkService.delete(API_ENDPOINTS.LIBRARY.BOOK_BY_ID(id)),

  listMembers: () => NetworkService.get(API_ENDPOINTS.LIBRARY.MEMBERS),
  getMember: (id) => NetworkService.get(API_ENDPOINTS.LIBRARY.MEMBER_BY_ID(id)),
  getMemberByCard: (cardNo) => NetworkService.get(API_ENDPOINTS.LIBRARY.MEMBER_BY_CARD(cardNo)),
  createMember: (data) => NetworkService.post(API_ENDPOINTS.LIBRARY.MEMBERS, data),
  updateMember: (id, data) => NetworkService.put(API_ENDPOINTS.LIBRARY.MEMBER_BY_ID(id), data),
  deleteMember: (id) => NetworkService.delete(API_ENDPOINTS.LIBRARY.MEMBER_BY_ID(id)),

  listIssues: () => NetworkService.get(API_ENDPOINTS.LIBRARY.ISSUES),
  getIssue: (id) => NetworkService.get(API_ENDPOINTS.LIBRARY.ISSUE_BY_ID(id)),
  createIssue: (data) => NetworkService.post(API_ENDPOINTS.LIBRARY.ISSUES, data),
  updateIssue: (id, data) => NetworkService.put(API_ENDPOINTS.LIBRARY.ISSUE_BY_ID(id), data),
  deleteIssue: (id) => NetworkService.delete(API_ENDPOINTS.LIBRARY.ISSUE_BY_ID(id)),

  // Sub-namespaces for UI components compatibility
  books: {
    list: () => NetworkService.get(API_ENDPOINTS.LIBRARY.BOOKS),
    get: (id) => NetworkService.get(API_ENDPOINTS.LIBRARY.BOOK_BY_ID(id)),
    create: (data) => NetworkService.post(API_ENDPOINTS.LIBRARY.BOOKS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.LIBRARY.BOOK_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.LIBRARY.BOOK_BY_ID(id))
  },
  members: {
    list: () => NetworkService.get(API_ENDPOINTS.LIBRARY.MEMBERS),
    get: (id) => NetworkService.get(API_ENDPOINTS.LIBRARY.MEMBER_BY_ID(id)),
    getByCard: (cardNo) => NetworkService.get(API_ENDPOINTS.LIBRARY.MEMBER_BY_CARD(cardNo)),
    create: (data) => NetworkService.post(API_ENDPOINTS.LIBRARY.MEMBERS, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.LIBRARY.MEMBER_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.LIBRARY.MEMBER_BY_ID(id))
  },
  issues: {
    list: () => NetworkService.get(API_ENDPOINTS.LIBRARY.ISSUES),
    get: (id) => NetworkService.get(API_ENDPOINTS.LIBRARY.ISSUE_BY_ID(id)),
    create: (data) => NetworkService.post(API_ENDPOINTS.LIBRARY.ISSUES, data),
    update: (id, data) => NetworkService.put(API_ENDPOINTS.LIBRARY.ISSUE_BY_ID(id), data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.LIBRARY.ISSUE_BY_ID(id))
  }
};

export default libraryService;