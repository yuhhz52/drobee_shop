import { Navigate } from "react-router-dom";
import { isTokenValid, getAccessToken, getUserInfo } from '@shared/utils/jwt-helper';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = getAccessToken();

  if (!isTokenValid(token)) {
    return <Navigate to="/v1/login" replace />;
  }

  if (requiredRole) {
    const user = getUserInfo();
    // Use optional chaining to prevent TypeError if roles is undefined
    const hasRole = user?.roles?.includes(requiredRole) ||
                    user?.roles?.some(role => role === 'ROLE_ADMIN' || role === 'ROLE_' + requiredRole.toUpperCase());
    if (!hasRole) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
