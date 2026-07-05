import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { NavLink } from 'react-router-dom';
import { setLoading } from '@app/store/slices/common.jsx';
import { registerAPI } from '@services/auth.service';
import GoogleSignIn from '@shared/components/Button/GoogleSignIn.jsx';
import PasswordInput from '@shared/components/PasswordInput.jsx';
import VerifyCode from './VerifyCode.jsx';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import '@shared/styles/AuthPages.css';

const Register = () => {
  const { t } = useTranslation();
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
        setApiError(err.message || t('auth.register.emailExists'));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, t]
  );

  if (enableVerify) return <VerifyCode email={watch('email')} />;

  return (
    <div className="horizon-auth-card">
      <div className="horizon-auth-card__head">
        <h1>{t('auth.createAccount')}</h1>
        <p>{t('auth.joinFamily')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="horizon-auth-row">
          <div className="horizon-auth-field">
            <label htmlFor="firstName">{t('auth.firstName')}</label>
            <input
              id="firstName"
              type="text"
              placeholder={t('auth.firstNamePlaceholder')}
              className={errors.firstName ? 'is-error' : ''}
              {...register('firstName', {
                required: t('auth.firstNameRequired'),
                minLength: {
                  value: 2,
                  message: t('auth.atLeast2Chars'),
                },
              })}
            />
            {errors.firstName && <p className="horizon-auth-error">{errors.firstName.message}</p>}
          </div>

          <div className="horizon-auth-field">
            <label htmlFor="lastName">{t('auth.lastName')}</label>
            <input
              id="lastName"
              type="text"
              placeholder={t('auth.lastNamePlaceholder')}
              className={errors.lastName ? 'is-error' : ''}
              {...register('lastName', {
                required: t('auth.lastNameRequired'),
                minLength: {
                  value: 2,
                  message: t('auth.atLeast2Chars'),
                },
              })}
            />
            {errors.lastName && <p className="horizon-auth-error">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="horizon-auth-field">
          <label htmlFor="email">{t('auth.email')}</label>
          <input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            className={errors.email ? 'is-error' : ''}
            {...register('email', {
              required: t('auth.emailRequired'),
              pattern: {
                value: /^\S+@\S+$/i,
                message: t('auth.invalidEmail'),
              },
            })}
          />
          {errors.email && <p className="horizon-auth-error">{errors.email.message}</p>}
        </div>

        <div className="horizon-auth-field">
          <label htmlFor="phone">{t('auth.phoneNumber')}</label>
          <input
            id="phone"
            type="tel"
            placeholder={t('auth.phonePlaceholder')}
            className={errors.phone ? 'is-error' : ''}
            {...register('phone', {
              required: t('auth.phoneRequired'),
              pattern: {
                value: /^[\d\s\-+()]{8,20}$/,
                message: t('auth.phoneInvalid'),
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
              required: t('auth.passwordRequired'),
              minLength: {
                value: 8,
                message: t('auth.passwordTooShort'),
              },
            }}
            render={({ field }) => (
              <PasswordInput
                id="password"
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
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
              required: t('auth.confirmPasswordRequired'),
              validate: (value) =>
                value === password || t('auth.passwordsDoNotMatch'),
            }}
            render={({ field }) => (
              <div className="flex flex-col gap-[8px]">
                <label className="font-bold text-[14px] text-gray-500 w-fit" htmlFor="confirmPassword">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
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
          {t('auth.createAccount')}
        </button>
      </form>

      <div className="horizon-auth-divider">{t('auth.or')}</div>
      <GoogleSignIn />

      <p className="horizon-auth-footer">
        {t('auth.alreadyHaveAccount')} <NavLink to="/v1/login">{t('auth.signIn')}</NavLink>
      </p>
    </div>
  );
};

export default Register;