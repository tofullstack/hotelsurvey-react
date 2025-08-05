// services/conditional.trigger.service.js
import api from './api';

const TRIGGER_BASE_URL = '/triggers';

const ConditionalTriggerService = {
  getConditionalForms: async (questionId, answerValue, language) => {
    try {
      const response = await api.get(
        `${TRIGGER_BASE_URL}/conditional-forms?questionId=${questionId}&answerValue=${answerValue}&language=${language}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conditional forms:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default ConditionalTriggerService;