import api from './api';

const USER_BASE_URL = '/auth/users'; 

const UserService = {
  getUsers: async (pagination) => {
    try {
      const params = {};
      if (pagination) {
        params.page = pagination.page; 
        params.size = pagination.rowsPerPage;
      }
      const response = await api.get(USER_BASE_URL, { params });
      
      return response.data;
    } catch (error) {
      console.error('Get users error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Função adicionada para corrigir o erro na página de edição
  getUserById: async (userId) => {
    try {
      const response = await api.get(`${USER_BASE_URL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Get user ${userId} error:`, error.response?.data || error.message);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post(USER_BASE_URL, userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`${USER_BASE_URL}/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error.response?.data || error.message);
      throw error;
    }
  },

  deactivateUser: async (userId) => {
    try {
      const response = await api.put(`${USER_BASE_URL}/${userId}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Deactivate user error:', error.response?.data || error.message);
      throw error;
    }
  },

  activateUser: async (userId) => {
    try {
      const response = await api.put(`${USER_BASE_URL}/${userId}/activate`);
      return response.data;
    } catch (error) {
      console.error('Activate user error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default UserService;
