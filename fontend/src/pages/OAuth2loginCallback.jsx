import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveTokens } from '../utils/jwt-helper';

const OAuth2loginCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      saveTokens(accessToken, refreshToken);
      navigate('/');
    } else {
      navigate('/v1/login');
    }
  }, [navigate]);

  return <></>;
}

export default OAuth2loginCallback;
