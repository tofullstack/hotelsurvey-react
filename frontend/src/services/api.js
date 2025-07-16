import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // URL base do backend Spring Boot
});

// interceptor para adicionar o token JWT em todas as requisições protegidas
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken'); // recupera o token da sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // adiciona o token ao cabeçalho Authorization
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
