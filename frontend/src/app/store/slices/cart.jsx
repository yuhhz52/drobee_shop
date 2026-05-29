import { createSlice } from "@reduxjs/toolkit";


const getCartFromLocalStorage = () => {
  try {
    const data = JSON.parse(localStorage.getItem("cart"));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(" Lỗi đọc localStorage:", err);
    return [];
  }
};

const saveCartToLocalStorage = (cart) => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (err) {
    console.error("Lỗi lưu localStorage:", err);
  }
};

const initialState = {
  cart: getCartFromLocalStorage(),
};

const cartSlice = createSlice({
  name: "cartState",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      const existingItem = state.cart.find(
        (p) => p.productId === item.productId && p.variant?.id === item.variant?.id
      );

      if (existingItem) {
        existingItem.quantity += item.quantity;
        existingItem.subTotal = existingItem.quantity * existingItem.price;
      } else {
        state.cart.push({
          ...item,
          subTotal: item.quantity * item.price,
        });
      }

      saveCartToLocalStorage(state.cart);
    },

    removeFromCart: (state, action) => {
      const { productId, variantId } = action.payload;

      state.cart = state.cart.filter(
        (item) => item.productId !== productId || item.variant?.id !== variantId
      );
      saveCartToLocalStorage(state.cart);
    },

    updateQuantity: (state, action) => {
      const { variantId, quantity } = action.payload;

      state.cart = state.cart.map((item) =>
        item.variant?.id === variantId
          ? {
              ...item,
              quantity,
              subTotal: quantity * item.price,
            }
          : item
      );
      saveCartToLocalStorage(state.cart);
    },

    deleteCart: (state) => {
      localStorage.removeItem("cart");
      state.cart = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  deleteCart,
} = cartSlice.actions;

export const countCartItems = (state) => state.cartState.cart.length;
export const selectCartItems = (state) => state.cartState.cart;

export default cartSlice.reducer;
