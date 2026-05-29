import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '@app/App';
import ShopLayout from '@features/layout/pages/ShopLayout';
import ProductListPage from '@features/catalog/pages/ProductListPage/ProductListPage';
import ProductDetails from '@features/catalog/pages/ProductDetails/ProductDetails';
import { loaderProductBySlug } from '@features/catalog/routes/product.loader';
import AuthenticationLayout from '@features/auth/layout/AuthenticationLayout';
import Register from '@features/auth/pages/Register/Register';
import Login from '@features/auth/pages/Login/Login';
import OAuth2LoginCallback from '@features/auth/pages/OAuth2LoginCallback';
import Cart from '@features/cart/pages/Cart/Cart';
import Account from '@features/account/pages/Account/Account';
import ProtectedRoute from '@shared/components/ProtectdRouter/ProtectedRouter';
import Checkout from '@features/checkout/pages/Checkout/Checkout';
import OrderConfirmed from '@features/order/pages/OrderComfirmed/OrderComfirmed';
import Profile from '@features/account/pages/Account/Profile';
import Orders from '@features/account/pages/Account/Orders';
import AdminPanel from '@features/admin/pages/AdminPanel/AdminPanel';
import ShopPages from '@features/shop/pages/ShopPages/ShopPages';
import Logouts from '@features/account/pages/Account/Logouts';
import StripeReturnHandler from '@features/payment/pages/StripeReturnHandler/StripeReturnHandler';
import Page403 from '@shared/components/Page403';
import AppRouteError from '@shared/components/AppRouteError';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ShopLayout />,
    errorElement: <AppRouteError />,
    children: [
      { path: '', element: <App /> },
      {
        path: 'men',
        element: <ProductListPage categoryType="nam" />,
      },
      {
        path: 'women',
        element: <ProductListPage categoryType="nu" />,
      },
      {
        path: 'accessories',
        element: <ProductListPage categoryType="phukien" />,
      },
      {
        path: 'new-arrivals',
        element: <ProductListPage categoryType={null} showNewArrivals />,
      },
      {
        path: 'products',
        element: <ProductListPage showAllProducts title="All" />,
      },
      {
        path: 'sale',
        element: <ProductListPage showSale title="Sale" />,
      },
      {
        path: 'product/:productSlug',
        loader: loaderProductBySlug,
        element: <ProductDetails />,
      },
      { path: 'shops', element: <ShopPages /> },
      { path: 'cart-items', element: <Cart /> },
      {
        path: 'login',
        element: <Navigate to="/v1/login" replace />,
      },
      {
        path: 'account-details/',
        element: (
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="profile" replace />,
          },
          {
            path: 'profile',
            element: (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            ),
          },
          {
            path: 'orders',
            element: (
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            ),
          },
          {
            path: 'logout',
            element: (
              <ProtectedRoute>
                <Logouts />
              </ProtectedRoute>
            ),
          },
        ],
      },
      { path: 'checkout', element: <Checkout /> },
      { path: '/orderConfirmed', element: <OrderConfirmed /> },
      { path: '/403', element: <Page403 /> },
    ],
  },
  {
    path: '/v1/',
    element: <AuthenticationLayout />,
    errorElement: <AppRouteError />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  { path: '/oauth2/callback', element: <OAuth2LoginCallback />, errorElement: <AppRouteError /> },
  { path: '/payment/stripe-success', element: <StripeReturnHandler />, errorElement: <AppRouteError /> },
  {
    path: '/admin/*',
    element: (
      <ProtectedRoute requiredRole="ROLE_ADMIN">
        <AdminPanel />
      </ProtectedRoute>
    ),
    errorElement: <AppRouteError />,
  },
  { path: '*', element: <AppRouteError /> },
]);
