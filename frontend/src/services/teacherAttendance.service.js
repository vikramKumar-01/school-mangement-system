import api from '../api/axios';

export const teacherAttendanceService = {
    // Teacher functions
    checkIn: async (data) => {
        const response = await api.post('/teacher-attendance/check-in', data);
        return response.data;
    },
    checkOut: async () => {
        const response = await api.post('/teacher-attendance/check-out');
        return response.data;
    },
    getToday: async () => {
        const response = await api.get('/teacher-attendance/today');
        return response.data.data;
    },
    getHistory: async (params) => {
        const response = await api.get('/teacher-attendance/history', { params });
        return response.data.data;
    },
    
    // Admin functions
    getAllAdmin: async (params) => {
        const response = await api.get('/teacher-attendance/admin', { params });
        return response.data.data;
    },
    createAdmin: async (data) => {
        const response = await api.post('/teacher-attendance/admin', data);
        return response.data.data;
    },
    updateAdmin: async (id, data) => {
        const response = await api.put(`/teacher-attendance/admin/${id}`, data);
        return response.data.data;
    },
    deleteAdmin: async (id) => {
        const response = await api.delete(`/teacher-attendance/admin/${id}`);
        return response.data.data;
    }
};
