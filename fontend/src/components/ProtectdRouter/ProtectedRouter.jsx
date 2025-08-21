import { Navigate } from "react-router-dom";
import { isTokenValid, getUserRoles } from "../../utils/jwt-helper";

const ProtectedRoute = ({ children, requiredRole }) => {
  if (!isTokenValid()) {
    return <Navigate to="/v1/login" replace />;
  }

  if (requiredRole) {
    const roles = getUserRoles();
    if (!roles.includes(requiredRole)) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
