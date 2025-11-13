import axios from "axios";

// Crear una instancia base
const api = axios.create({
  baseURL: "http://localhost:8080", // ajusta si tu backend está en otro host
});

// Agregar interceptor para incluir el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // leer token almacenado
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
