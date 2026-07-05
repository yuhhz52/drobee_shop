import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveTokens, isTokenValid } from '@shared/utils/jwt-helper';
import { httpClient } from '@core/api/httpClient';
import { cartService } from '@services/cart.service';
import { useTranslation } from '@shared/i18n/useTranslation.js';

const OAuth2LoginCallback = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Read tokens from HTTP-Only cookies via backend API
    // Custom Domain: cookies are same-site, no URL fallback needed
    httpClient.get('/oauth2/tokens')
      .then(async res => {
        const { accessToken, refreshToken } = res.data;
        if (accessToken && refreshToken && isTokenValid(accessToken)) {
          saveTokens(accessToken, refreshToken);
          // Merge anonymous cart into user cart
          try {
            await cartService.mergeCart();
          } catch (e) {
            console.warn('Cart merge failed:', e);
          }
          navigate('/');
        } else {
          console.warn('OAuth2 callback: invalid tokens from cookies');
          navigate('/v1/login');
        }
      })
      .catch(() => {
        console.error('OAuth2 callback failed: cookies not found or session expired');
        navigate('/v1/login');
      });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('auth.oauth.signingIn')}</p>
      </div>
    </div>
  );
}

export default OAuth2LoginCallback;
