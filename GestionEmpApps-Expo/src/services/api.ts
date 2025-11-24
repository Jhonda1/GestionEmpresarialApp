import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tu-api.com',
  timeout: 10000,
});

export default api;
