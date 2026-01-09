import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptors FIRST, before any API calls are defined
api.interceptors.request.use(
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

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Now define all your API functions AFTER interceptors are set up
export const getBills = async () => {
  const response = await api.get("/bills");
  return response.data;
};

export const getBillById = async (id) => {
  const response = await api.get(`/bills/${id}`);
  return response.data;
};

export const createBill = async (billData) => {
  const response = await api.post("/bills", billData);
  return response.data;
};

export const updateBill = async (id, billData) => {
  const response = await api.put(`/bills/${id}`, billData);
  return response.data;
};

export const deleteBill = async (id) => {
  await api.delete(`/bills/${id}`);
};

export const downloadBillPDF = async (id) => {
  const response = await api.get(`/bills/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
};
export const getRooms = () => api.get("/admin/rooms");
export const createRoom = (roomData) => api.post("/admin/rooms", roomData);
export const updateRoom = (id, roomData) =>
  api.put(`/admin/rooms/${id}`, roomData);
export const deleteRoom = (id) => api.delete(`/admin/rooms/${id}`);
export const getRoomsByBranch = (branchId) =>
  api.get(`/admin/rooms/branch/${branchId}`);

// Branches API calls
export const getBranches = () => api.get("/admin/branches");
export const createBranch = (branchData) =>
  api.post("/admin/branches", branchData);
export const updateBranch = (id, branchData) =>
  api.put(`/admin/branches/${id}`, branchData);
export const deleteBranch = (id) => api.delete(`/admin/branches/${id}`);
// Stats API calls
export const getDashboardStats = () => api.get("/admin/stats");
export const getStatsByDateRange = (startDate, endDate) =>
  api.get(`/admin/stats/range?startDate=${startDate}&endDate=${endDate}`);
export const getBranchStats = (branchId) =>
  api.get(`/admin/stats/branch/${branchId}`);
export const getRealTimeStats = () => api.get("/admin/stats/realtime");
export default api;
