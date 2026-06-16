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
    watch,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  const password = watch('password');

  const onSubmit = useCallback(
    async (data) => {
      setApiError('');
      dispatch(setLoading(true));
      try {
        const payload = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          phoneNumber: data.phone,
        };
        const res = await registerAPI(payload);
        if (res?.code === 200 || res?.status === 200) {
          setEnableVerify(true);
        } else {
          throw new Error(res?.message || 'Registration failed');
        }
      } catch (err) {
        setApiError(err.message || 'This email is already registered or invalid.');
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  if (enableVerify) return <VerifyCode email={watch('email')} />;

  return (
    <div className="horizon-auth-card">
      <div className="horizon-auth-card__head">
        <h1>Create account</h1>
        <p>Join the Horizon Rider Family and shop premium electric scooters.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="horizon-auth-row">
          <div className="horizon-auth-field">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              className={errors.firstName ? 'is-error' : ''}
              {...register('firstName', {
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'At least 2 characters',
                },
              })}
            />
            {errors.firstName && <p className="horizon-auth-error">{errors.firstName.message}</p>}
          </div>

          <div className="horizon-auth-field">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              className={errors.lastName ? 'is-error' : ''}
              {...register('lastName', {
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'At least 2 characters',
                },
              })}
            />
            {errors.lastName && <p className="horizon-auth-error">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="horizon-auth-field">
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
          {errors.email && <p className="horizon-auth-error">{errors.email.message}</p>}
        </div>

        <div className="horizon-auth-field">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="0912 345 678"
            className={errors.phone ? 'is-error' : ''}
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^[\d\s\-+()]{8,20}$/,
                message: 'Invalid phone number',
              },
            })}
          />
          {errors.phone && <p className="horizon-auth-error">{errors.phone.message}</p>}
        </div>

        <div className="horizon-auth-field">
          <Controller
            name="password"
            control={control}
            rules={{
              required: 'Please enter a password',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            }}
            render={({ field }) => (
              <PasswordInput
                id="password"
                label="Password"
                placeholder="At least 8 characters"
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

        <div className="horizon-auth-field">
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            }}
            render={({ field }) => (
              <div className="flex flex-col gap-[8px]">
                <label className="font-bold text-[14px] text-gray-500 w-fit" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  className={`h-[48px] w-full px-[8px] bg-white border transition-all truncate pr-10 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-400'
                  }`}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {apiError && <p className="horizon-auth-error">{apiError}</p>}

        <button type="submit" className="horizon-auth-submit" style={{ marginTop: '1rem' }}>
          Create account
        </button>
      </form>

      <div className="horizon-auth-divider">or</div>
      <GoogleSignIn />

      <p className="horizon-auth-footer">
        Already have an account? <NavLink to="/v1/login">Sign in</NavLink>
      </p>
    </div>
  );
};

export default Register;
