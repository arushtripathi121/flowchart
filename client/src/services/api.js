import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const flowchartAPI = {
  generateFlowchart: async (prompt, style = 'modern', complexity = 'medium') => {
    try {
      const response = await api.post('/flowchart/generate', {
        prompt,
        style,
        complexity
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate flowchart');
    }
  },

  validateFlowchart: async (flowchartData) => {
    try {
      const response = await api.post('/flowchart/validate', {
        flowchartData
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate flowchart');
    }
  },

  getFormats: async () => {
    try {
      const response = await api.get('/flowchart/formats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get formats');
    }
  }
};

export default api;
