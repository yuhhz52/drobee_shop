import { Navigate } from "react-router-dom";
import { isTokenValid, getAccessToken, getUserInfo } from "../../utils/jwt-helper";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = getAccessToken();

  if (!isTokenValid(token)) {
    return <Navigate to="/v1/login" replace />;
  }

  if (requiredRole) {
    const user = getUserInfo();
    if (!user?.roles.includes(requiredRole)) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
