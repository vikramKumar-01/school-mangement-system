import api from '../api/axios';

export const marksService = {
  getAll: async (params) => {
    const response = await api.get('/marks', { params });
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/marks', data);
    return response.data.data;
  },
};
