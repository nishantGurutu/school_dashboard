import NetworkService from './networkService';
import { API_BASE_URL, API_ENDPOINTS } from './apiConfig';

export const certificateService = {
  list: () => NetworkService.get(API_ENDPOINTS.CERTIFICATES.BASE),
  get: (id) => NetworkService.get(API_ENDPOINTS.CERTIFICATES.BY_ID(id)),
  create: (data) => NetworkService.post(API_ENDPOINTS.CERTIFICATES.BASE, data),
  update: (id, data) => NetworkService.put(API_ENDPOINTS.CERTIFICATES.BY_ID(id), data),
  remove: (id) => NetworkService.delete(API_ENDPOINTS.CERTIFICATES.BY_ID(id)),
  getPdfUrl: (id) => `${API_BASE_URL}/certificates/${id}/pdf`,
  getDownloadUrl: (id) => `${API_BASE_URL}/certificates/${id}/download`,
  downloadPdf: (certificate) => {
    const downloadUrl = `${API_BASE_URL}/certificates/${certificate.id}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Certificate_${(certificate.name || 'student').replace(/[^a-z0-9_-]/gi, '_')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default certificateService;