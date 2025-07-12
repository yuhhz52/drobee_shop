import { addToCart, deleteCart, removeFromCart, updateQuantity } from "../features/cart";   

// localStorage đã được cập nhật trong reducers, không cần updateLocalStorage nữa

export const addItemToCartAction = (productItem)=>{
    return (dispath) =>{
        dispath(addToCart(productItem));
    }
}

export const updateItemCartAction = (productItem) =>{
    return (dispath)=>{
        dispath(updateQuantity({
            variant_id: productItem?.variant_id,
            quantity: productItem?.quantity
        }))
    }
}

export const delteItemFromCartAction = (payload)=>{
    return (dispatch)=>{
        dispatch(removeFromCart(payload));
    }
}


export const clearCart = ()=>{
    return (dispatch) =>{
       dispatch(deleteCart());
       // localStorage đã được xóa trong deleteCart reducer
    }
}