import api from './api';

const REPORTS_BASE_URL = '/reports';

const ReportService = {
  getSurveyResponses: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.companyId) params.append('companyId', filters.companyId);
      if (filters.language) params.append('language', filters.language);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`${REPORTS_BASE_URL}/responses`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching survey responses:', error.response?.data || error.message);
      throw error;
    }
  },

  getSurveyResponseById: async (id) => {
    try {
      const response = await api.get(`${REPORTS_BASE_URL}/responses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching survey response by ID:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default ReportService;