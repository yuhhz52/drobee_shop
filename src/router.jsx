import { createBrowserRouter } from "react-router-dom"; 
import App from "./App";
import ShopApplication from "./pages/ShopApplication";
import ProductListPage from "./pages/ProductListPage/ProductListPage";

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
                path: "products",
                element: <ProductListPage categoryType={'WOMEN'} />,
            },
            {
                path: "products1",
                element: <ProductListPage categoryType={'MEN'} />,
            }

        ]
    }             
]);