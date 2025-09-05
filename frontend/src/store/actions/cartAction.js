import { addToCart, deleteCart, removeFromCart, updateQuantity } from "../features/cart";

export const addItemToCartAction = (productItem) => {
  return (dispatch) => {
    dispatch(addToCart(productItem));
  };
};

export const updateItemCartAction = (productItem) => {
  return (dispatch) => {
    dispatch(updateQuantity({
      variantId: productItem?.variant_id,
      quantity: productItem?.quantity
    }));
  };
};

export const delteItemFromCartAction = (payload) => {
  return (dispatch) => {
    dispatch(removeFromCart({
      productId: payload?.productId,
      variantId: payload?.variantId
    }));
  };
};

export const clearCart = () => {
  return (dispatch) => {
    dispatch(deleteCart());
  };
};
