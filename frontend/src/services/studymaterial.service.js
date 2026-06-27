import api from '../api/axios';

export const studyMaterialService = {
  getAll: async (params) => {
    const response = await api.get('/study-materials', { params });
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/study-materials', data);
    return response.data.data;
  },
};
