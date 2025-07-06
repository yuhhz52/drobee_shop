import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid'; // Dùng để tạo id duy nhất

// Lấy dữ liệu từ localStorage nếu có
const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];

export const initialState = {
  categories: storedCategories
};

export const categorySlice = createSlice({
  name: 'categorySlice',
  initialState,
  reducers: {
    // Load lại toàn bộ danh sách
    loadCategories: (state, action) => {
      const categories = action.payload || [];
      localStorage.setItem('categories', JSON.stringify(categories));
      return {
        ...state,
        categories
      };
    },

  
  }
});

export const { loadCategories } = categorySlice.actions;

export default categorySlice.reducer;
