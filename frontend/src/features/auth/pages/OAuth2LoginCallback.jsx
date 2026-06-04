import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveTokens, isTokenValid } from '@shared/utils/jwt-helper';

const OAuth2loginCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    // Validate tokens before saving
    if (accessToken && refreshToken && isTokenValid(accessToken)) {
      saveTokens(accessToken, refreshToken);
      navigate('/');
    } else {
      console.error('OAuth2 callback: Invalid or expired tokens received');
      navigate('/v1/login');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}

export default OAuth2loginCallback;
