import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scanAPI = {
  createScan: (targetUrl: string, authToken?: string, tests?: string[]) =>
    apiClient.post('/api/scan', {
      target_url: targetUrl,
      auth_token: authToken,
      tests: tests,
    }),

  getScan: (scanId: string) =>
    apiClient.get(`/api/scan/${scanId}`),

  listScans: () =>
    apiClient.get('/api/scans'),

  downloadReport: (scanId: string) =>
    apiClient.get(`/api/report/${scanId}/pdf`, {
      responseType: 'blob',
    }),
};
