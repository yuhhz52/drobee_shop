import { createBrowserRouter } from "react-router-dom"; 
import App from "./App";
import ShopApplication from "./pages/ShopApplication";
import ProductListPage from "./pages/ProductListPage/ProductListPage.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import { loaderProductBySlug } from "./routes/product.js";
import AutheticationWrapper from "./pages/AutheticationWrapper";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import OAuth2loginCallback from "./pages/OAuth2loginCallback";
import Cart from "./pages/Cart/Cart";
import Account from "./pages/Account/Account";
import ProtectedRoute from "./components/ProtectdRouter/ProtectedRouter.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import ConfirmPayment from "./pages/ConfirmPayment/ConfirmPayment.jsx";
import OrderConfirmed from "./pages/OrderComfirmed/OrderComfirmed.jsx";
import Profile from "./pages/Account/Profile.jsx";
import Settings from "./pages/Account/Settings.jsx";
import Orders from "./pages/Account/Orders.jsx";
import AdminPanel from "./pages/AdminPanel/AdminPanel.jsx";

export const router = createBrowserRouter([
    { 
        path: "/",
        element: <ShopApplication />,
        children: [
            {
                path: "",
                element: <App/>,
            },
            {
                path: "men",
                element: <ProductListPage categoryType={'nam'} />,
            },
            {
                path: "women",
                element: <ProductListPage categoryType={'nu'} />,
            },
            {
                path: "product/:productSlug",
                loader: loaderProductBySlug,
                element: <ProductDetails />,
            },
            {
                path: "cart-items",
                element: <Cart/>
            },
            {
                path: "account-details/",
                element: <ProtectedRoute><Account/></ProtectedRoute>,
                children: [
                    {
                        path: 'profile',
                        element:<ProtectedRoute><Profile/></ProtectedRoute>
                    },
                    {
                        path: 'orders',
                        element:<ProtectedRoute><Orders/></ProtectedRoute>
                    },
                    {
                        path: 'settings',
                        element:<ProtectedRoute><Settings/></ProtectedRoute>
                    }
                 ]
            },
            {
                path: "checkout",
                element: <ProtectedRoute><Checkout/></ProtectedRoute>
            },
            {
            path:'/orderConfirmed',
            element: <OrderConfirmed />
            }


        ]
    },
    {
        path: "/v1/",
        element: <AutheticationWrapper />,
        children: [
            {
                path: "login",
                element:<Login />
            },
            {
                path: "register",
                element:<Register />
            }
        ]
    },
    {
        path: '/oauth2/callback',
        element : <OAuth2loginCallback />
    },
    {
      path:'/confirmPayment',
      element:<ConfirmPayment />
    },
    {
      path:'/admin/*',
      element:<ProtectedRoute><AdminPanel/></ProtectedRoute>
    }         
]);