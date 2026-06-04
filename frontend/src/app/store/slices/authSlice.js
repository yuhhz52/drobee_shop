
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginAPI, getProfileAPI } from "../../../services/auth.service";

export const login = createAsyncThunk("auth/login", async (credentials) => {
  return await loginAPI(credentials);
});

export const fetchProfile = createAsyncThunk("auth/profile", async () => {
  // getProfileAPI already returns res.data, so don't use res.data again
  return await getProfileAPI();
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