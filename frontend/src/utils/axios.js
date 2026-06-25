import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// REQUEST INTERCEPTOR
// Adds Bearer token automatically
// Also supports cookie auth because withCredentials is true
// ===============================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===============================
// RESPONSE INTERCEPTOR
// Handles expired login/session
// ===============================

API.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    const requestUrl = error?.config?.url || "";
    const method = error?.config?.method || "";

    const isUserLoginRequest =
      requestUrl.includes("/users/auth");

    const isSellerLoginRequest =
      requestUrl.includes("/users/seller/auth");

    const isRegisterRequest =
      requestUrl === "/users" &&
      method.toLowerCase() === "post";

    const isSellerRegisterRequest =
      requestUrl.includes("/users/seller/register");

    const isAuthRequest =
      isUserLoginRequest ||
      isSellerLoginRequest ||
      isRegisterRequest ||
      isSellerRegisterRequest;

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");

      const currentPath =
        window.location.pathname + window.location.search;

      const isSellerPath =
        window.location.pathname.startsWith("/seller");

      const alreadyOnLoginPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/seller/login";

      const loginPath = isSellerPath
        ? `/seller/login?redirect=${encodeURIComponent(currentPath)}`
        : `/login?redirect=${encodeURIComponent(currentPath)}`;

      if (!alreadyOnLoginPage) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);

export default API;