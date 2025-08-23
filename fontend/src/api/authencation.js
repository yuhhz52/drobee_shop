import axios from "axios";
import { API_BASE_URL } from "./constant";
import axiosInstance from "../utils/axiosInstance";
import { saveTokens, clearTokens, getAccessToken  } from "../utils/jwt-helper";

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
    await axiosInstance.post("/api/auth/logout");
  } catch (err) {
    console.error("Logout API failed", err);
  } finally {
    clearTokens();
    window.location.href = "/";
  }
};
// import axios from 'axios';
// import { API_BASE_URL } from './constant';
// import axiosInstance from "../utils/axiosInstance";

// export const loginAPI = async (body) => {
    
//     const url = API_BASE_URL + '/api/auth/login';
//     try{
//         const response = await axios.post(url, body);
//     const { token, refreshToken } = response.data;

//     localStorage.setItem("accessToken", token);
//     localStorage.setItem("refreshToken", refreshToken);

//     return response.data;

//     }catch(err) {
//         throw new Error(err); 
//     }
    
// }
// export const registerAPI = async (body)=>{
//     const url = API_BASE_URL + '/api/auth/register';
//     try{
//         const response = await axios(url,{
//             method:"POST",
//             data:body
//         });
//         return response?.data;
//     }
//     catch(err){
//         throw new Error(err);
//     }
// }

// export const verifyAPI = async (body)=>{
//     const url = API_BASE_URL + '/api/auth/verify';
//     try{
//         const response = await axios(url,{
//             method:"POST",
//             data:body
//         });
//         return response?.data;
//     }
//     catch(err){
//         throw new Error(err);
//     }
// }


// export const getProfileAPI = () => {
//   return axiosInstance.get("/api/auth/profile");
// };