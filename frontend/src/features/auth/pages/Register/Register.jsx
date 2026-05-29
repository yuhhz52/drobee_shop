import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { NavLink } from 'react-router-dom';
import { setLoading } from '@app/store/slices/common.jsx';
import { registerAPI } from '@services/auth.service';
import GoogleSignIn from '@shared/components/Button/GoogleSignIn.jsx';
import PasswordInput from '@shared/components/PasswordInput.jsx';
import VerifyCode from './VerifyCode.jsx';
import '@shared/styles/AuthPages.css';

const Register = () => {
  const dispatch = useDispatch();
  const [enableVerify, setEnableVerify] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      setApiError('');
      dispatch(setLoading(true));
      try {
        const res = await registerAPI(data);
        if (res?.code === 200 || res?.status === 200) {
          setEnableVerify(true);
        } else {
          throw new Error('Email already exists');
        }
      } catch {
        setApiError('This email is already registered or invalid.');
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  if (enableVerify) return <VerifyCode email={control._formValues.email} />;

  return (
    <div className="vepace-auth-card">
      <div className="vepace-auth-card__head">
        <h1>Create account</h1>
        <p>Join the Vepace Rider Family and shop premium electric scooters.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="vepace-auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            className={errors.email ? 'is-error' : ''}
            {...register('email', {
              required: 'Please enter your email',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Please enter a valid email',
              },
            })}
          />
          {errors.email && <p className="vepace-auth-error">{errors.email.message}</p>}
        </div>

        <div className="vepace-auth-field">
          <Controller
            name="password"
            control={control}
            rules={{ required: 'Please enter a password' }}
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

        {apiError && <p className="vepace-auth-error">{apiError}</p>}

        <button type="submit" className="vepace-auth-submit" style={{ marginTop: '1rem' }}>
          Create account
        </button>
      </form>

      <div className="vepace-auth-divider">or</div>
      <GoogleSignIn />

      <p className="vepace-auth-footer">
        Already have an account? <NavLink to="/v1/login">Sign in</NavLink>
      </p>
    </div>
  );
};

export default Register;
