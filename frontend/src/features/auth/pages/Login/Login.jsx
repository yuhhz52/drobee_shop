import React, { useCallback, useEffect, useState } from 'react';
import GoogleSignIn from '@shared/components/Button/GoogleSignIn.jsx';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoading } from '@app/store/slices/common.jsx';
import { loginAPI } from '@services/auth.service';
import { cartService } from '@services/cart.service';
import { Controller, useForm } from 'react-hook-form';
import PasswordInput from '@shared/components/PasswordInput.jsx';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import '@shared/styles/AuthPages.css';

const Login = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const verifiedSuccess = searchParams.get('verified') === 'success';
  const [showToast, setShowToast] = useState(verifiedSuccess);

  useEffect(() => {
    const hasVerified = sessionStorage.getItem('verifiedSuccess') === 'true';
    if (hasVerified) {
      setShowToast(true);
      sessionStorage.removeItem('verifiedSuccess');
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: { userName: '', password: '' },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = useCallback(
    async (data) => {
      dispatch(setLoading(true));
      try {
        const res = await loginAPI(data);
        if (res?.accessToken || res?.token) {
          try {
            await cartService.mergeCart();
          } catch (e) {
            console.warn('Cart merge failed:', e);
          }
          navigate('/');
        } else {
          throw new Error('Invalid response');
        }
      } catch {
        alert(t('auth.invalidCredentials'));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate, t]
  );

  return (
    <>
      {showToast && (
        <div className="horizon-auth-toast" role="status">
          <div>
            <strong>{t('auth.accountVerified')}</strong>
            {t('auth.emailConfirmed')}
          </div>
        </div>
      )}

      <div className="horizon-auth-card">
        <div className="horizon-auth-card__head">
          <h1>{t('auth.loginSignupTitle')}</h1>
          <p>{t('auth.welcomeBack')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="horizon-auth-field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              className={errors.userName ? 'is-error' : ''}
              {...register('userName', {
                required: t('auth.emailRequired'),
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: t('auth.invalidEmail'),
                },
              })}
            />
            {errors.userName && (
              <p className="horizon-auth-error">{errors.userName.message}</p>
            )}
          </div>

          <div className="horizon-auth-field">
            <Controller
              name="password"
              control={control}
              rules={{ required: t('auth.passwordRequired') }}
              render={({ field }) => (
                <PasswordInput
                  id="password"
                  label={t('auth.password')}
                  placeholder={t('auth.password')}
                  error={errors.password}
                  innerRef={field.ref}
                  isInvalid={errors.password}
                  value={field.value}
                  onChange={field.onChange}
                  errors={errors.password?.message}
                />
              )}
            />
          </div>

          <button type="button" className="horizon-auth-forgot">
            {t('auth.forgotPassword')}
          </button>

          <button type="submit" className="horizon-auth-submit">
            {t('auth.signIn')}
          </button>
        </form>

        <div className="horizon-auth-divider">{t('auth.or')}</div>
        <GoogleSignIn />

        <p className="horizon-auth-footer">
          {t('auth.dontHaveAccount')}{' '}
          <NavLink to="/v1/register">{t('auth.createAccount')}</NavLink>
        </p>
      </div>
    </>
  );
};

export default Login;