import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '@services/auth.service';
import { setLoading } from '@app/store/slices/common.jsx';

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const login = useCallback(
    async (credentials) => {
      dispatch(setLoading(true));
      setError(null);
      try {
        const res = await authService.login(credentials);
        if (res?.accessToken || res?.token) {
          navigate('/');
          return res;
        }
        throw new Error('Invalid response');
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate]
  );

  return { login, error };
};

export const useLogout = () => {
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  return { logout, loading };
};

export const useRegister = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const register = useCallback(
    async (data) => {
      dispatch(setLoading(true));
      setError(null);
      try {
        return await authService.register(data);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  return { register, error };
};
