/**
 * Centralized API Configuration and Endpoint Definitions
 * Base URL defaults to Spring Boot Backend running on http://localhost:8080/api
 */

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Authentication & Session
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },

  // User Profile
  PROFILE: {
    ME: '/profile/me'
  },

  // Admin Dashboard Statistics
  ADMIN_DASHBOARD: {
    STATS: '/admin/stats'
  },

  // Student Management
  STUDENTS: {
    BASE: '/students',
    SEARCH: '/students/search',
    BY_CLASS: (className) => `/students/class/${encodeURIComponent(className)}`,
    BY_ADMISSION: (admissionNo) => `/students/admission/${encodeURIComponent(admissionNo)}`,
    BY_ID: (id) => `/students/${id}`,
    STATUS: (id) => `/students/${id}/status`
  },

  // Parent & Guardian Management
  GUARDIANS: {
    BASE: '/guardians',
    SEARCH: '/guardians/search',
    BY_EMAIL: (email) => `/guardians/email/${encodeURIComponent(email)}`,
    BY_STUDENT: (admissionNo) => `/guardians/student/${encodeURIComponent(admissionNo)}`,
    BY_ID: (id) => `/guardians/${id}`
  },

  // Teacher Management
  TEACHERS: {
    BASE: '/teachers',
    SEARCH: '/teachers/search',
    BY_EMPLOYEE: (employeeId) => `/teachers/employee/${encodeURIComponent(employeeId)}`,
    BY_EMAIL: (email) => `/teachers/email/${encodeURIComponent(email)}`,
    BY_DEPARTMENT: (department) => `/teachers/department/${encodeURIComponent(department)}`,
    BY_ID: (id) => `/teachers/${id}`,
    STATUS: (id) => `/teachers/${id}/status`
  },

  // Staff Management
  STAFF: {
    BASE: '/staff',
    BY_ID: (id) => `/staff/${id}`
  },

  // School Classes, Sections, Subjects & Classrooms
  CLASSES: {
    CLASSES: '/classes/classes',
    CLASS_BY_ID: (id) => `/classes/classes/${id}`,
    SECTIONS: '/classes/sections',
    SECTION_BY_ID: (id) => `/classes/sections/${id}`,
    SUBJECTS: '/classes/subjects',
    SUBJECT_BY_ID: (id) => `/classes/subjects/${id}`,
    ROOMS: '/classes/rooms',
    ROOM_BY_ID: (id) => `/classes/rooms/${id}`
  },

  // Examinations, Schedules & Results
  EXAMS: {
    EXAMS: '/exams/exams',
    EXAM_BY_ID: (id) => `/exams/exams/${id}`,
    SCHEDULES: '/exams/schedules',
    SCHEDULE_BY_ID: (id) => `/exams/schedules/${id}`,
    RESULTS: '/exams/results',
    RESULT_BY_ID: (id) => `/exams/results/${id}`
  },

  // Fees Collections, Types, Groups & Discounts
  FEES: {
    COLLECTIONS: '/fees/collections',
    COLLECTION_BY_ID: (id) => `/fees/collections/${id}`,
    TYPES: '/fees/types',
    TYPE_BY_ID: (id) => `/fees/types/${id}`,
    GROUPS: '/fees/groups',
    GROUP_BY_ID: (id) => `/fees/groups/${id}`,
    DISCOUNTS: '/fees/discounts',
    DISCOUNT_BY_ID: (id) => `/fees/discounts/${id}`
  },

  // Attendance Management
  ATTENDANCE: {
    BASE: '/attendance',
    BY_ID: (id) => `/attendance/${id}`
  },

  // Leave Management (Types & Requests)
  LEAVES: {
    TYPES: '/leaves/types',
    TYPE_BY_ID: (id) => `/leaves/types/${id}`,
    REQUESTS: '/leaves/requests',
    REQUEST_BY_ID: (id) => `/leaves/requests/${id}`
  },

  // Library Management (Books, Members & Issues)
  LIBRARY: {
    BOOKS: '/library/books',
    BOOK_BY_ID: (id) => `/library/books/${id}`,
    MEMBERS: '/library/members',
    MEMBER_BY_ID: (id) => `/library/members/${id}`,
    MEMBER_BY_CARD: (cardNo) => `/library/members/card/${encodeURIComponent(cardNo)}`,
    ISSUES: '/library/issues',
    ISSUE_BY_ID: (id) => `/library/issues/${id}`
  },

  // Accounts & Finance Management
  ACCOUNTS: {
    SUMMARY: '/accounts/summary',
    TRANSACTIONS: '/accounts/transactions',
    TRANSACTION_BY_ID: (id) => `/accounts/transactions/${id}`
  },

  // Human Resources Management
  HRM: {
    SUMMARY: '/hrm/summary'
  },

  // Notice Board
  NOTICES: {
    BASE: '/notices',
    BY_ID: (id) => `/notices/${id}`
  },

  // Certificates
  CERTIFICATES: {
    BASE: '/certificates',
    BY_ID: (id) => `/certificates/${id}`
  }
};

export default API_ENDPOINTS;
