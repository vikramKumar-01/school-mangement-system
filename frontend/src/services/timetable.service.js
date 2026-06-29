import api from '../api/axios';

export const timetableService = {
  getAll: async (params) => {
    const response = await api.get('/timetable', { params });
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/timetable', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/timetable/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/timetable/${id}`);
    return response.data.data;
  }
};
