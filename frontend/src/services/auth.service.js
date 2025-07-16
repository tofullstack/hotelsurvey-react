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

  createUser: async (userData) => {
    try {
      const response = await api.post(`${AUTH_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error.response?.data || error.message);
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

  // TODO: lembrar de inserir os outros métodos de gerenciamento de usuário (desativar, ativar, etc.) apos testes
  getUsers: async () => {
    try {
      const response = await api.get(`${AUTH_BASE_URL}/users`);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default AuthService;