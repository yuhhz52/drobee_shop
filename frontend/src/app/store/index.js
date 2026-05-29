import { combineReducers, configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/product.jsx';
import cartReducer from './slices/cart.jsx';
import categoryReducer from './slices/category.jsx';
import commonReducer from './slices/common.jsx';
import userReducer from './slices/user.jsx';

const rootReducer = combineReducers({
  productState: productReducer,
  cartState: cartReducer,
  categoryState: categoryReducer,
  commonState: commonReducer,
  userState: userReducer,
});

const store = configureStore({ reducer: rootReducer });

export default store;
