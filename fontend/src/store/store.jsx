
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import productReducer from "./features/product.jsx";
import cartReducer from './features/cart.jsx';
import categoryReducer from './features/category.jsx';
import commonReducer from './features/common.jsx';
import userReducer from './features/user.jsx';

const rootReducer = combineReducers({
    productState: productReducer,
    cartState: cartReducer,
    categoryState: categoryReducer,
    commonState: commonReducer,
    userState: userReducer,
})

const store = configureStore({
    reducer: rootReducer
})

export default store