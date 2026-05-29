export { productService, getAllProducts, getProductBySlug } from './product.service';
export { categoryService, fetchCategories } from './category.service';
export { authService, loginAPI, registerAPI, verifyAPI, getProfileAPI, logoutAPI } from './auth.service';
export { userService, fetchUserDetails, fetchOrderAPI, cancelOrderAPI, addAddressAPI, deleteAddressAPI } from './user.service';
export { orderService, placeOrderAPI, confirmPaymentAPI } from './order.service';
export { uploadService, fileUploadAPI } from './upload.service';
