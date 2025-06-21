import { createBrowserRouter } from "react-router-dom"; 
import App from "./App";
import ProductListPage from "./pages/ProductListPage/ProductListPage";

export const router = createBrowserRouter([
    { 
        path: "/",
        element: <App/>,
    },
    {
        path: "/products",
        element: <ProductListPage/>,
    }
]);