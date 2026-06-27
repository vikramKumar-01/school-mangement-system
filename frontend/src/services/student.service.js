import api from '../api/axios';

export const studentService = {
  getAll: async (params) => {
    const response = await api.get('/students', { params });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/students', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data.data;
  },
};
