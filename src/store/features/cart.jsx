import { createSlice } from "@reduxjs/toolkit"

// {id:Number,quantity:number}

const initialState = {
    cart:JSON.parse(localStorage.getItem('cart')) || []
}

// Debug: Log initial cart state
console.log('Initial cart state from localStorage:', JSON.parse(localStorage.getItem('cart')) || []);

const cartSlice = createSlice({
    name:'cartState',
    initialState:initialState,
    reducers:{
        addToCart:(state,action) =>{
            const newItem = action?.payload;
            console.log('addToCart - newItem:', newItem);
            console.log('addToCart - newItem.price:', newItem?.price);
            console.log('addToCart - newItem.quantity:', newItem?.quantity);
            
            // Tìm sản phẩm trùng (cùng productId và cùng variant.id)
            const existingItem = state.cart.find(item => 
                item.productId === newItem.productId && 
                item.variant?.id === newItem.variant?.id
            );
            if (existingItem) {
                existingItem.quantity += newItem.quantity;
                existingItem.subTotal = existingItem.quantity * existingItem.price;
                console.log('addToCart - updated existing item subTotal:', existingItem.subTotal);
            } else {
                // Đảm bảo có subTotal khi thêm mới
                const subTotal = newItem.quantity * newItem.price;
                console.log('addToCart - calculated subTotal for new item:', subTotal);
                state.cart.push({
                    ...newItem,
                    subTotal: subTotal
                });
            }
            // Cập nhật localStorage
            localStorage.setItem('cart', JSON.stringify(state.cart));
            console.log('addToCart - final cart state:', state.cart);
            return state;
        },
        removeFromCart:(state,action)=>{
            const newState = {
                ...state,
                cart :  state?.cart?.filter((item) => ((item.id !== action?.payload?.productId) && (item?.variant?.id !== action?.payload?.variantId)))
            };
            // Cập nhật localStorage
            localStorage.setItem('cart', JSON.stringify(newState.cart));
            return newState;
        },
        updateQuantity:(state,action) =>{
            const newState = {
                ...state,
                cart: state?.cart?.map((item)=>{
                    if(item?.variant?.id === action?.payload?.variant_id){
                        return {
                            ...item,
                            quantity:action?.payload?.quantity,
                            subTotal: action?.payload?.quantity * item.price
                        }
                    }
                    return item;
                })
            };
            // Cập nhật localStorage
            localStorage.setItem('cart', JSON.stringify(newState.cart));
            return newState;
        },
        deleteCart : (state,action)=>{
            // Clear localStorage khi xóa cart
            localStorage.removeItem('cart');
            return {
                ...state,
                cart:[]
            }
        }
    }
})

export const { addToCart, removeFromCart, updateQuantity, deleteCart } = cartSlice?.actions;

export const countCartItems = (state) => state?.cartState?.cart?.length;
export const selectCartItems = (state) => state?.cartState?.cart ?? []
export default cartSlice.reducer;