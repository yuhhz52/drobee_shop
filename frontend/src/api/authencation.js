import axios from "axios";
import { API_BASE_URL } from "./constant";
import axiosInstance from "../utils/axiosInstance";
import { saveTokens, clearTokens, getRefreshToken  } from "../utils/jwt-helper";

export const loginAPI = async (body) => {
  const url = API_BASE_URL + "/api/auth/login";
  const response = await axios.post(url, body);
  const { token, refreshToken } = response.data;
  saveTokens(token, refreshToken);
  return response.data;
};

export const registerAPI = (body) =>
  axios.post(`${API_BASE_URL}/api/auth/register`, body).then((res) => res.data);

export const verifyAPI = (body) =>
  axios.post(`${API_BASE_URL}/api/auth/verify`, body).then((res) => res.data);

export const getProfileAPI = () => axiosInstance.get("/api/auth/profile");

export const logoutAPI = async () => {
  try {
    const refreshToken = getRefreshToken();

    // Gửi refresh token trong body (an toàn hơn query param)
    await axiosInstance.post("/api/auth/logout", {
      refreshToken,
    });
  } catch (err) {
    console.error("Logout API failed", err);
  } finally {
    clearTokens();
    window.location.href = "/";
  }
};
