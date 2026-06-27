import api from '../api/axios';

export const noticeService = {
  getAll: async () => {
    const response = await api.get('/notices');
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/notices', data);
    return response.data.data;
  },
};
