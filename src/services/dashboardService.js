import apiRequest from './api';

async function unwrap(promise) {
  const response = await promise;
  return response && response.data !== undefined ? response.data : response;
}

export const dashboardService = {
  stats: () => unwrap(apiRequest('/admin/stats')),
  accounts: () => unwrap(apiRequest('/accounts/summary')),
  hrm: () => unwrap(apiRequest('/hrm/summary'))
};