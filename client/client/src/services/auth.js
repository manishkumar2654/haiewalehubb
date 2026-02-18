import api from "./api";

export const authService = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  googleLogin: (tokenId) => api.post("/auth/google", { tokenId }),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  sendVerificationEmail: () => api.post("/auth/send-verification-email"),
  getProfile: () => api.get("/auth/me"),
};
