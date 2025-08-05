import api from './api';

const REPORTS_BASE_URL = '/reports';

const ReportService = {
  getSurveyResponses: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.companyId) params.append('companyId', filters.companyId);
      if (filters.companyName) params.append('companyName', filters.companyName); // para o filtro de nome da empresa
      if (filters.language) params.append('language', filters.language);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`${REPORTS_BASE_URL}/responses`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar respostas da pesquisa:', error.response?.data || error.message);
      throw error;
    }
  },

  getSurveyResponseById: async (id) => {
    try {
      const response = await api.get(`${REPORTS_BASE_URL}/responses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar respostas da pesquisa por ID:', error.response?.data || error.message);
      throw error;
    }
  }

  // filtro do form pelo nome da empresa

  
};

export default ReportService;