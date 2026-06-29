import api from '../api/axios';

export const settingsService = {
    getSettings: async () => {
        const response = await api.get('/settings');
        return response.data.data;
    },
    updateSettings: async (data) => {
        const response = await api.put('/settings', data);
        return response.data.data;
    }
};
