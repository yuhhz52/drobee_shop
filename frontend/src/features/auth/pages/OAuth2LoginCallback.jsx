import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveTokens, isTokenValid } from '@shared/utils/jwt-helper';

/**
 * OAuth2 callback handler - reads tokens from cookies set by backend
 * and saves them to localStorage for the app to use.
 */
const OAuth2loginCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Read tokens from cookies (set by backend as HTTP-Only cookies)
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + ' ' +
        '=([^;]+)'));
      return match ? match[2] : null;
    };

    const accessToken = getCookie('accessToken');
    const refreshToken = getCookie('refreshToken');

    if (accessToken && refreshToken) {
      // Validate tokens before saving to localStorage
      if (isTokenValid(accessToken)) {
        saveTokens(accessToken, refreshToken);

        // Clear the cookies so they don't persist (tokens now in localStorage)
        document.cookie = 'accessToken=; Max-Age=0; path=/';
        document.cookie = 'refreshToken=; Max-Age=0; path=/';

        navigate('/');
      } else {
        console.warn('OAuth2 callback: access token expired');
        navigate('/v1/login');
      }
    } else {
      // No tokens in cookies - might be using session-based auth
      // Just redirect to home, the httpClient interceptor will handle auth
      navigate('/');
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
