import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const client = axios.create({
  baseURL: apiBaseUrl,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const detailCode = error.response?.data?.code;

    const isAuthPath =
      originalRequest?.url?.includes("/auth/login/") ||
      originalRequest?.url?.includes("/auth/register/") ||
      originalRequest?.url?.includes("/auth/refresh/");

    if (status === 401 && !originalRequest?._retry && !isAuthPath && detailCode === "token_not_valid") {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        return Promise.reject(error);
      }

      try {
        const { data } = await refreshClient.post("/auth/refresh/", { refresh });
        localStorage.setItem("access", data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return client(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
