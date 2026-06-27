import api from '../api/axios';

export const attendanceService = {
  getAll: async (params) => {
    const response = await api.get('/attendance', { params });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/attendance', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data.data;
  },
};
