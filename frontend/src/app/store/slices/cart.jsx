import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '@services/cart.service';
import { getCartSessionId, setCartSessionId } from '@shared/utils/cart-session';

/**
 * Creates a composite key for local cart items.
 * Uses :: separator instead of - to avoid conflicts with UUID hyphens.
 */
const createLocalKey = (productId, variantId) => {
  return `${productId}::${variantId || 'default'}`;
};

/**
 * Parses a composite key back into productId and variantId.
 */
const parseLocalKey = (key) => {
  const parts = key.split('::');
  return {
    productId: parts[0],
    variantId: parts[1] === 'default' ? null : parts[1]
  };
};

/**
 * Checks if a string is a valid UUID.
 */
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

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
  // Return full cart object to get cartId
  return res || { items: [] };
});

export const addItemToCart = createAsyncThunk(
  'cart/add',
  async (item, { rejectWithValue }) => {
    try {
      // Ensure productId is a valid UUID string
      const productId = String(item.productId);
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);

      if (!isValidUUID) {
        console.error('[addItemToCart] Invalid productId format:', productId);
        return rejectWithValue({ message: 'Invalid product ID format', code: 'INVALID_ID' });
      }

      // Backend expects: { productId: UUID, variantId: UUID|null, quantity: number }
      const payload = {
        productId: productId,
        variantId: item.variant?.id && item.variant.id !== 'default'
          ? String(item.variant.id)
          : null,
        quantity: Number(item.quantity) || 1,
      };

      console.log('[addItemToCart] sending to backend:', payload);
      const res = await cartService.addItem(payload);
      // Backend returns CartResponse: { id, items, totalItems, totalAmount }
      console.log('[addItemToCart] backend response:', res);
      return res;
    } catch (err) {
      console.error('[addItemToCart] error:', err);
      // Extract meaningful error message from backend
      const errorData = err.response?.data;
      let errorMessage = 'Failed to add item to cart';

      if (errorData?.errorCode === 'OUT_OF_STOCK') {
        // Extract stock info from message: "Requested quantity exceeds available stock. Available: 25"
        const match = errorData.message?.match(/Available:\s*(\d+)/);
        const available = match ? match[1] : '';
        errorMessage = `Requested quantity exceeds available stock${available ? `. Only ${available} available` : ''}`;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      return rejectWithValue({
        message: errorMessage,
        code: errorData?.errorCode || 'UNKNOWN_ERROR'
      });
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    if (!isUUID(itemId)) {
      // Composite key - update locally
      return { localUpdate: itemId, quantity };
    }

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
  async (itemIdOrKey, { rejectWithValue }) => {
    if (!isUUID(itemIdOrKey)) {
      // Not a UUID = composite key for local item
      return { localRemove: itemIdOrKey };
    }

    try {
      const res = await cartService.removeItem(itemIdOrKey);
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
  // Return full cart object to get cartId
  return res || { items: [] };
});

const initialState = {
  items: getInitialCart(),
  loading: false,
  error: null,
  synced: false,
  cartId: null,
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
        // Use backend item ID if synced, otherwise use local key
        const itemToAdd = {
          ...item,
          subTotal: item.quantity * item.price,
          // If backend returns an ID, use it
          id: item.id || createLocalKey(item.productId, item.variant?.id)
        };
        state.items.push(itemToAdd);
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
        console.log('[fetchCart.fulfilled] payload:', action.payload);
        // Backend returns cart object: { id, items, totalItems, totalAmount }
        const cartData = action.payload || {};
        const items = cartData.items || cartData || [];
        state.items = items;
        state.cartId = cartData.id || null;
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
        console.log('[addItemToCart.fulfilled] backend items:', action.payload);
        // Backend returns cart object: { id, items, totalItems, totalAmount }
        const cartData = action.payload || {};
        const items = cartData.items || cartData || [];
        state.items = items;
        state.cartId = cartData.id || state.cartId;
        state.loading = false;
        state.synced = true;
        localStorage.setItem('cart', JSON.stringify(state.items));
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        // Extract message from rejectWithValue payload
        state.error = payload?.message || payload || 'Failed to add item to cart';
      })

      .addCase(updateCartItem.fulfilled, (state, action) => {
        console.log('[updateCartItem.fulfilled] action.payload:', action.payload);
        // Handle local update (composite key)
        if (action.payload?.localUpdate) {
          const { productId, variantId } = parseLocalKey(action.payload.localUpdate);
          const normalizedVariantId = variantId || 'default';
          state.items = state.items.map((item) =>
            item.productId === productId && (item.variant?.id || 'default') === normalizedVariantId
              ? { ...item, quantity: action.payload.quantity, subTotal: action.payload.quantity * item.price }
              : item
          );
          localStorage.setItem('cart', JSON.stringify(state.items));
        } else {
          // Backend returns cart object: { items: [...] } or array [...]
          const items = action.payload?.items || action.payload || [];
          state.items = items;
          state.synced = true;
          localStorage.setItem('cart', JSON.stringify(state.items));
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        const itemId = action.meta?.arg?.itemId;
        const quantity = action.meta?.arg?.quantity;
        if (itemId) {
          if (!isUUID(itemId)) {
            // Composite key
            const { productId, variantId } = parseLocalKey(itemId);
            const normalizedVariantId = variantId || 'default';
            state.items = state.items.map((item) =>
              item.productId === productId && (item.variant?.id || 'default') === normalizedVariantId
                ? { ...item, quantity, subTotal: quantity * item.price }
                : item
            );
          } else {
            // UUID
            state.items = state.items.map((item) =>
              item.id === itemId
                ? { ...item, quantity, subTotal: quantity * item.price }
                : item
            );
          }
          localStorage.setItem('cart', JSON.stringify(state.items));
        }
        state.error = action.payload || action.error?.message;
      })

      .addCase(removeCartItem.fulfilled, (state, action) => {
        console.log('[removeCartItem.fulfilled] payload:', action.payload);
        // Handle local removal (composite key)
        if (action.payload?.localRemove) {
          const { productId, variantId } = parseLocalKey(action.payload.localRemove);
          const normalizedVariantId = variantId || 'default';
          const beforeCount = state.items.length;
          state.items = state.items.filter(
            (i) => !(i.productId === productId && (i.variant?.id || 'default') === normalizedVariantId)
          );
          console.log('[removeCartItem.fulfilled] local remove:', productId, variantId, 'removed:', beforeCount - state.items.length);
          localStorage.setItem('cart', JSON.stringify(state.items));
        } else {
          // Backend returns cart object: { items: [...] } or array [...]
          const items = action.payload?.items || action.payload || [];
          state.items = items;
          state.synced = true;
          localStorage.setItem('cart', JSON.stringify(state.items));
        }
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        const itemId = action.meta?.arg;
        if (itemId) {
          if (!isUUID(itemId)) {
            // Composite key - local item
            const { productId, variantId } = parseLocalKey(itemId);
            const normalizedVariantId = variantId || 'default';
            const beforeCount = state.items.length;
            state.items = state.items.filter(
              (i) => !(i.productId === productId && (i.variant?.id || 'default') === normalizedVariantId)
            );
            console.log('[removeCartItem.rejected] local remove:', productId, variantId, 'removed:', beforeCount - state.items.length);
          } else {
            // UUID - backend item
            const beforeCount = state.items.length;
            state.items = state.items.filter((i) => i.id !== itemId);
            console.log('[removeCartItem.rejected] UUID remove:', itemId, 'removed:', beforeCount - state.items.length);
          }
          localStorage.setItem('cart', JSON.stringify(state.items));
        }
        state.error = action.payload || action.error?.message;
      })

      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.cartId = null;
        state.synced = true;
        localStorage.removeItem('cart');
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(syncCart.fulfilled, (state, action) => {
        console.log('[syncCart.fulfilled] payload:', action.payload);
        // Backend returns cart object: { items: [...] } or array [...]
        const items = action.payload?.items || action.payload || [];
        state.items = items;
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
export const selectCartError = (state) => state.cartState.error;
export const selectCartLoading = (state) => state.cartState.loading;
export const selectCartId = (state) => state.cartState.cartId;

export default cartSlice.reducer;
