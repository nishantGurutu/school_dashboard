import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

/**
 * Holiday Service
 * Pure API integration with Spring Boot backend (/api/holidays).
 * Zero static mock data or seeds. All holiday data is loaded dynamically from the API.
 */
export const holidayService = {
  /**
   * List all school holidays from backend
   */
  list: () => NetworkService.get(API_ENDPOINTS.HOLIDAYS.BASE),

  /**
   * Get single school holiday by ID
   */
  get: (id) => NetworkService.get(API_ENDPOINTS.HOLIDAYS.BY_ID(id)),

  /**
   * Create a new school holiday
   * @param {Object} data { title, date, endDate, category, target, description }
   */
  create: (data) => NetworkService.post(API_ENDPOINTS.HOLIDAYS.BASE, data),

  /**
   * Update an existing school holiday
   * @param {number|string} id
   * @param {Object} data { title, date, endDate, category, target, description }
   */
  update: (id, data) => NetworkService.put(API_ENDPOINTS.HOLIDAYS.BY_ID(id), data),

  /**
   * Delete a school holiday by ID
   */
  remove: (id) => NetworkService.delete(API_ENDPOINTS.HOLIDAYS.BY_ID(id)),

  /**
   * Check if a specific date is a school holiday
   * @param {string} date YYYY-MM-DD
   */
  check: (date) => NetworkService.get(API_ENDPOINTS.HOLIDAYS.CHECK(date))
};

export default holidayService;
