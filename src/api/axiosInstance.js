import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('doctorToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use((response) => response,   (error) => {
    if (error.response && error.response.status === 401) {
      if (error.config.url !== '/') {
        localStorage.removeItem('doctorToken');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
