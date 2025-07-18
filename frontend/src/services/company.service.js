import api from './api';

const COMPANY_BASE_URL = '/companies';

const CompanyService = {
  createCompany: async (companyData) => {
    try {
      const response = await api.post(COMPANY_BASE_URL, companyData);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllCompanies: async () => {
    try {
      const response = await api.get(COMPANY_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error.response?.data || error.message);
      throw error;
    }
  },

  getCompanyById: async (id) => {
    try {
      const response = await api.get(`${COMPANY_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company by ID:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCompany: async (id, companyData) => {
    try {
      const response = await api.put(`${COMPANY_BASE_URL}/${id}`, companyData);
      return response.data;
    } catch (error) {
      console.error('Error updating company:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteCompany: async (id) => {
    try {
      const response = await api.delete(`${COMPANY_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting company:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default CompanyService;