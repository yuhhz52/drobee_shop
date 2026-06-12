import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '@services/cart.service';
import { getCartSessionId, setCartSessionId } from '@shared/utils/cart-session';

const getInitialCart = () => {
  try {
    const data = JSON.parse(localStorage.getItem('cart'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const res = await cartService.getCart();
  return res.items || [];
});

export const addItemToCart = createAsyncThunk(
  'cart/add',
  async (item, { rejectWithValue }) => {
    try {
      const res = await cartService.addItem({
        productId: item.productId,
        variantId: item.variant?.id || null,
        quantity: item.quantity || 1,
      });
      return res.items || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await cartService.updateQuantity(itemId, quantity);
      return res.items || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/remove',
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await cartService.removeItem(itemId);
      return res.items || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const syncCart = createAsyncThunk('cart/sync', async () => {
  const res = await cartService.getCart();
  return res.items || [];
});

const initialState = {
  items: getInitialCart(),
  loading: false,
  error: null,
  synced: false,
};

const cartSlice = createSlice({
  name: 'cartState',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find(
        (p) => p.productId === item.productId && p.variant?.id === item.variant?.id
      );
      if (existing) {
        existing.quantity += item.quantity;
        existing.subTotal = existing.quantity * existing.price;
      } else {
        state.items.push({ ...item, subTotal: item.quantity * item.price });
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        (i) => i.productId !== productId || i.variant?.id !== variantId
      );
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { variantId, quantity } = action.payload;
      state.items = state.items.map((item) =>
        item.variant?.id === variantId
          ? { ...item, quantity, subTotal: quantity * item.price }
          : item
      );
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    deleteCart: (state) => {
      localStorage.removeItem('cart');
      state.items = [];
    },
    setCartItems: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.synced = true;
        localStorage.setItem('cart', JSON.stringify(state.items));
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(addItemToCart.pending, (state) => { state.loading = true; })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.synced = true;
        localStorage.setItem('cart', JSON.stringify(state.items));
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload;
        state.synced = true;
        localStorage.setItem('cart', JSON.stringify(state.items));
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload;
        state.synced = true;
        localStorage.setItem('cart', JSON.stringify(state.items));
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.synced = true;
        localStorage.removeItem('cart');
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(syncCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.synced = true;
        localStorage.setItem('cart', JSON.stringify(state.items));
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  deleteCart,
  setCartItems,
} = cartSlice.actions;

export const countCartItems = (state) => state.cartState.items.length;
export const selectCartItems = (state) => state.cartState.items;

export default cartSlice.reducer;
