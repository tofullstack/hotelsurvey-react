import api from './api';

const FORM_ADMIN_BASE_URL = '/forms';

const FormService = {
  createForm: async (formData) => {
    try {
      const response = await api.post(FORM_ADMIN_BASE_URL, formData);
      return response.data;
    } catch (error) {
      console.error('Error creating form:', error.response?.data || error.message);
      throw error;
    }
  },

  getFormById: async (formId) => {
    try {
      const response = await api.get(`${FORM_ADMIN_BASE_URL}/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form by ID:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllForms: async () => {
    try {
      const response = await api.get(FORM_ADMIN_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all forms:', error.response?.data || error.message);
      throw error;
    }
  },

  updateForm: async (formId, formData) => {
    try {
      const response = await api.put(`${FORM_ADMIN_BASE_URL}/${formId}`, formData);
      return response.data;
    } catch (error) {
      console.error('Error updating form:', error.response?.data || error.message);
      throw error;
    }
  },

  deactivateForm: async (formId) => {
    try {
      const response = await api.delete(`${FORM_ADMIN_BASE_URL}/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating form:', error.response?.data || error.message);
      throw error;
    }
  },

  activateForm: async (formId) => {
    try {
      const response = await api.put(`${FORM_ADMIN_BASE_URL}/${formId}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating form:', error.response?.data || error.message);
      throw error;
    }
  },

  previewForm: async (formId) => {
    try {
      const response = await api.get(`${FORM_ADMIN_BASE_URL}/${formId}/preview`);
      return response.data;
    } catch (error) {
      console.error('Error previewing form:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default FormService;