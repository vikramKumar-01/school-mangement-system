import api from '../api/axios';

export const contactService = {
  /**
   * Submit a contact inquiry — public, no auth required
   * @param {{ name: string, email: string, subject: string, message: string }} data
   */
  submit: async (data) => {
    const response = await api.post('/contact', data);
    return response.data;
  },

  /**
   * Get all contact inquiries — admin only
   * @param {{ page?: number, limit?: number, status?: string }} params
   */
  getAll: async (params = {}) => {
    const response = await api.get('/contact', { params });
    return response.data.data;
  },

  /**
   * Update a contact inquiry status — admin only
   * @param {string} id
   * @param {'new'|'read'|'replied'} status
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/contact/${id}/status`, { status });
    return response.data.data;
  },
};
