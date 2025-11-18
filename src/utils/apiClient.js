import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create();

// Add request interceptor to handle API URL
apiClient.interceptors.request.use(
  (config) => {
    // Use the VITE_API_URL environment variable, with a fallback
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ai-resume-screener-o80a.onrender.com/api';
    if (config.url && !config.url.startsWith('http')) {
      config.url = `${apiUrl}${config.url}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;