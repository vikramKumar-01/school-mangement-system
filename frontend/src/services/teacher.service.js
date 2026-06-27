import api from '../api/axios';

export const teacherService = {
  getAll: async (params) => {
    const response = await api.get('/teachers', { params });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/teachers', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data.data;
  },
};
