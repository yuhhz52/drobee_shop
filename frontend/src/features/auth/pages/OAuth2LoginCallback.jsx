import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveTokens, isTokenValid } from '@shared/utils/jwt-helper';
import { httpClient } from '@core/api/httpClient';

/**
 * OAuth2 callback handler - reads tokens from HTTP-Only cookies via backend API
 * and saves them to localStorage for the app to use.
 */
const OAuth2loginCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Gọi backend endpoint để đọc tokens từ HTTP-Only cookies
    httpClient.get('/oauth2/tokens')
      .then(res => {
        const { accessToken, refreshToken } = res.data;

        if (accessToken && refreshToken && isTokenValid(accessToken)) {
          saveTokens(accessToken, refreshToken);
          navigate('/');
        } else {
          console.warn('OAuth2 callback: invalid or expired tokens');
          navigate('/v1/login');
        }
      })
      .catch(err => {
        console.error('OAuth2 callback failed:', err);
        navigate('/v1/login');
      });
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
