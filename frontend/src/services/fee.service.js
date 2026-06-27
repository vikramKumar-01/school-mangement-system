import api from '../api/axios';

export const feeService = {
  getAll: async (params) => {
    const response = await api.get('/fees', { params });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/fees/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/fees', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/fees/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/fees/${id}`);
    return response.data.data;
  },
};
