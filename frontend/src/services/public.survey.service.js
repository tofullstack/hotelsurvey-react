import api from './api';

const PUBLIC_SURVEY_BASE_URL = '/survey';

const PublicSurveyService = {
  getSurveyQuestions: async (companyId, language) => {
    try {
      const response = await api.get(`${PUBLIC_SURVEY_BASE_URL}/questions/${companyId}/${language}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching survey questions:', error.response?.data || error.message);
      throw error;
    }
  },

  submitSurveyResponse: async (surveyData) => {
    try {
      const response = await api.post(`${PUBLIC_SURVEY_BASE_URL}/submit-response`, surveyData);
      return response.data;
    } catch (error) {
      console.error('Error submitting survey response:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default PublicSurveyService;