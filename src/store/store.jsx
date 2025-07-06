
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import productReducter from './features/product'
import createReducer from './features/cart'
import categoryReducer from './features/category'
import comomReducer from './features/common'

const rootReducer = combineReducers({
    productState: productReducter,
    cartState: createReducer,
    categoryState: categoryReducer,
    commonState: comomReducer
})

const store = configureStore({
    reducer: rootReducer
})

export default store