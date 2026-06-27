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
};
