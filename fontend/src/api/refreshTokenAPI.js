import axios from "axios";
import { API_BASE_URL } from './constant';

export const refreshTokenAPI = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token found");

  const url = API_BASE_URL + '/api/auth/refresh';
  try {
    const response = await axios.post(url, { refreshToken });
    const { token, refreshToken: newRefreshToken } = response.data;

    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", newRefreshToken);

    return token;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};
