import { createBrowserRouter } from "react-router-dom"; 
import App from "./App";
import LayoutShop from "./pages/Layout.jsx";
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
import OrderConfirmed from "./pages/OrderComfirmed/OrderComfirmed.jsx";
import Profile from "./pages/Account/Profile.jsx";
import Orders from "./pages/Account/Orders.jsx";
import AdminPanel from "./pages/AdminPanel/AdminPanel.jsx";
import ShopPages from "./pages/ShopPages/ShopPages.jsx";
import Logouts from "./pages/Account/Logouts.jsx";
import StripeReturnHandler from "./pages/StripeReturnHandler/StripeReturnHandler.jsx";



export const router = createBrowserRouter([
    { 
        path: "/",
        element: <LayoutShop />,
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
                path: "accessories",
                element: <ProductListPage categoryType={'phukien'} />,
            },
            {
                path: "new-arrivals",
                element: <ProductListPage categoryType={null} showNewArrivals={true} />,
            },
            {
                path: "product/:productSlug",
                loader: loaderProductBySlug,
                element: <ProductDetails />,
            },
            {
                path: "shops",
                element: <ShopPages/>
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
                        path: 'logout',
                        element:<ProtectedRoute><Logouts/></ProtectedRoute>
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
      path:'/payment/stripe-success',
      element:<StripeReturnHandler />
    },
    {
      path:'/admin/*',
      element:<ProtectedRoute><AdminPanel/></ProtectedRoute>
    }         
]);