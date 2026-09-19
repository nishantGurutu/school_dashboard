import NetworkService from './networkService';
import { API_ENDPOINTS } from './apiConfig';

export const accountService = {
  getSummary: async () => {
    const res = await NetworkService.get(API_ENDPOINTS.ACCOUNTS.SUMMARY);
    return res?.data || res;
  },

  listTransactions: () => NetworkService.get(API_ENDPOINTS.ACCOUNTS.TRANSACTIONS),

  createTransaction: (data) => NetworkService.post(API_ENDPOINTS.ACCOUNTS.TRANSACTIONS, data),

  deleteTransaction: (id) => NetworkService.delete(API_ENDPOINTS.ACCOUNTS.TRANSACTION_BY_ID(id)),

  // Sub-namespaces for UI compatibility
  summary: async () => {
    const res = await NetworkService.get(API_ENDPOINTS.ACCOUNTS.SUMMARY);
    return res?.data || res;
  },

  transactions: {
    list: () => NetworkService.get(API_ENDPOINTS.ACCOUNTS.TRANSACTIONS),
    create: (data) => NetworkService.post(API_ENDPOINTS.ACCOUNTS.TRANSACTIONS, data),
    remove: (id) => NetworkService.delete(API_ENDPOINTS.ACCOUNTS.TRANSACTION_BY_ID(id))
  }
};

export default accountService;
