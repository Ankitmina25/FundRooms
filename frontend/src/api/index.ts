import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally (redirect to login except for login endpoint)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ---- Auth API ----
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  getMe: () => api.get("/auth/me"),
};

// ---- Customer API ----
export const customerAPI = {
  getAll: (params?: any) => api.get("/customers", { params }),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post("/customers", data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  addFollowUp: (id: number, data: any) =>
    api.post(`/customers/${id}/follow-up`, data),
};

// ---- Product API ----
export const productAPI = {
  getAll: (params?: any) => api.get("/products", { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post("/products", data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  addStock: (id: number, data: any) => api.post(`/products/${id}/stock`, data),
  getLowStock: () => api.get("/products/low-stock"),
};

// ---- Challan API ----
export const challanAPI = {
  getAll: (params?: any) => api.get("/challans", { params }),
  getById: (id: number) => api.get(`/challans/${id}`),
  create: (data: any) => api.post("/challans", data),
  updateStatus: (id: number, status: string) =>
    api.put(`/challans/${id}/status`, { status }),
};
