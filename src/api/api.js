// api.js - Make sure you have an interceptor like this
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // or your backend URL
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



export default api;