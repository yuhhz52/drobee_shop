import { createSlice } from '@reduxjs/toolkit';

const normalizeCategories = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

// Lấy dữ liệu từ localStorage nếu có
let storedCategories = [];
try {
  storedCategories = normalizeCategories(
    JSON.parse(localStorage.getItem('categories'))
  );
} catch {
  storedCategories = [];
}

export const initialState = {
  categories: storedCategories
};

export const categorySlice = createSlice({
  name: 'categorySlice',
  initialState,
  reducers: {
    // Load lại toàn bộ danh sách
    loadCategories: (state, action) => {
      const categories = normalizeCategories(action.payload);
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
