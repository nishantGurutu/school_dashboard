import { NetworkService, authStorage } from './networkService';
import { API_BASE_URL, API_ENDPOINTS } from './apiConfig';

export { authStorage, API_BASE_URL, API_ENDPOINTS, NetworkService };

export async function apiRequest(path, options = {}) {
  return NetworkService.request(path, options);
}

export default apiRequest;