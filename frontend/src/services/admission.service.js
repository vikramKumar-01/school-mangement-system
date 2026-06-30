import api from '../api/axios';

export const admissionService = {
  /**
   * Submit an admission application — public, no auth required
   * @param {FormData} formData
   */
  submit: async (formData) => {
    const response = await api.post('/admissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all admission applications — admin only
   * @param {{ page?: number, limit?: number, status?: string, search?: string }} params
   */
  getAll: async (params = {}) => {
    const response = await api.get('/admissions', { params });
    return response.data.data;
  },

  /**
   * Update admission status — admin only
   * @param {string} id
   * @param {'pending'|'reviewed'|'contacted'|'approved'|'rejected'} status
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/admissions/${id}/status`, { status });
    return response.data.data;
  },
};
