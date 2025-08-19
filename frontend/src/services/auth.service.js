import api from './api';

const AUTH_BASE_URL = '/auth';

const AuthService = {
  login: async (credentials) => {
    try {
      const response = await api.post(`${AUTH_BASE_URL}/login`, credentials);
      return response.data; // deve retornar { token, userId, profile, mustChangePassword }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },


  changePassword: async (passwordData) => {
    try {
      const response = await api.put(`${AUTH_BASE_URL}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error.response?.data || error.message);
      throw error;
    }
  },

};

export default AuthService;