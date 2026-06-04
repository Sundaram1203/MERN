import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4444/api/auth";

// Axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("unauthorized"));
    }
    return Promise.reject(error);
  }
);

/**
 * Register a new user
 */
const register = (first_name, last_name, email, password) => {
  const created_dt = new Date().toISOString().slice(0, 19).replace("T", " ");
  return api.post("/register", { first_name, last_name, email, password, created_dt });
};

/**
 * Verify OTP
 */
const otpVerify = (email, otp, otp_time) => {
  return api.post("/otp_verify", { email, otp: parseInt(otp), otp_time });
};

/**
 * Login user and store session
 */
const login = (email, password) => {
  return api.post("/login", { email, password }).then((response) => {
    if (response.data?.status && response.data?.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response.data;
  });
};

/**
 * Get all users list
 */
const loginList = () => {
  return api.get("/login_list");
};

/**
 * View single user by ID
 */
const loginView = (id) => {
  return api.post("/login_view", { id });
};

/**
 * Logout user
 */
const logout = (user_id) => {
  localStorage.removeItem("user");
  if (user_id) {
    return api.post("/logout", { user_id }).catch(() => {
      // Swallow errors on logout — session is already cleared locally
    });
  }
  return Promise.resolve();
};

/**
 * Upload profile image
 */
const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

/**
 * Get current user from localStorage
 */
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const AuthService = {
  register,
  otpVerify,
  login,
  loginList,
  loginView,
  logout,
  uploadImage,
  getCurrentUser
};

export default AuthService;
