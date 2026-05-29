import React, { useCallback, useEffect, useState } from 'react';
import GoogleSignIn from '@shared/components/Button/GoogleSignIn.jsx';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoading } from '@app/store/slices/common.jsx';
import { loginAPI } from '@services/auth.service';
import { Controller, useForm } from 'react-hook-form';
import PasswordInput from '@shared/components/PasswordInput.jsx';
import '@shared/styles/AuthPages.css';

const Login = () => {
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
          navigate('/');
        } else {
          throw new Error('Invalid response');
        }
      } catch {
        alert('Invalid email or password. Please try again.');
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate]
  );

  return (
    <>
      {showToast && (
        <div className="vepace-auth-toast" role="status">
          <div>
            <strong>Account verified</strong>
            Your email has been confirmed. You can sign in now.
          </div>
        </div>
      )}

      <div className="vepace-auth-card">
        <div className="vepace-auth-card__head">
          <h1>Login / Signup</h1>
          <p>Welcome back. Sign in to continue shopping at VEPACE.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="vepace-auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className={errors.userName ? 'is-error' : ''}
              {...register('userName', {
                required: 'Please enter your email',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email',
                },
              })}
            />
            {errors.userName && (
              <p className="vepace-auth-error">{errors.userName.message}</p>
            )}
          </div>

          <div className="vepace-auth-field">
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Please enter your password' }}
              render={({ field }) => (
                <PasswordInput
                  id="password"
                  label="Password"
                  placeholder="Password"
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

          <button type="button" className="vepace-auth-forgot">
            Forgot password?
          </button>

          <button type="submit" className="vepace-auth-submit">
            Sign in
          </button>
        </form>

        <div className="vepace-auth-divider">or</div>
        <GoogleSignIn />

        <p className="vepace-auth-footer">
          Don&apos;t have an account?{' '}
          <NavLink to="/v1/register">Create account</NavLink>
        </p>
      </div>
    </>
  );
};

export default Login;
