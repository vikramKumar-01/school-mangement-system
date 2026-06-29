import api from '../api/axios';

export const holidayService = {
    getAll: async () => {
        const response = await api.get('/holidays');
        return response.data.data;
    },
    create: async (data) => {
        const response = await api.post('/holidays', data);
        return response.data.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/holidays/${id}`, data);
        return response.data.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/holidays/${id}`);
        return response.data.data;
    }
};
