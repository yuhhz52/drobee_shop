
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginAPI, getProfileAPI } from "../../api/authencation";

export const login = createAsyncThunk("auth/login", async (credentials) => {
  return await loginAPI(credentials);
});

export const fetchProfile = createAsyncThunk("auth/profile", async () => {
  const res = await getProfileAPI();
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;