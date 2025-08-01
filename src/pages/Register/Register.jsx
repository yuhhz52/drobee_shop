import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { NavLink } from 'react-router-dom';
import { setLoading } from '../../store/features/common';
import { registerAPI } from '../../api/authencation.js';
import GoogleSignIn from '../../components/Button/GoogleSignIn.jsx';
import PasswordInput from '../../components/PasswordInput.jsx';
import VerifyCode from './VerifyCode.jsx';

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
      } catch{
        setApiError('Email đã tồn tại hoặc không hợp lệ!');
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  if (enableVerify) return <VerifyCode email={control._formValues.email} />;

  return (
    <div className='bg-widget flex items-center justify-center w-full py-10 px-4 lg:p-[110px]'>
      <div className='max-w-[460px] w-full'>
        <div className='flex flex-col gap-2.5 text-center'>
          <h1 className='text-4xl font-bold'>Đăng ký tài khoản</h1>
          <p className='lg:max-w-[300px] m-auto'>Tạo tài khoản để bắt đầu mua sắm cùng chúng tôi.</p>
        </div>

        <form className='mt-5' onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <div className='flex flex-col gap-5'>
            <div className='flex flex-col gap-[8px]'>
              <label className='font-bold text-[14px] text-gray-500'>Email</label>
              <input
                type='email'
                placeholder='Địa chỉ email'
                className={`h-[48px] w-full border p-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-400'
                }`}
                {...register('email', {
                  required: 'Vui lòng nhập địa chỉ email',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Địa chỉ email không hợp lệ',
                  },
                })}
              />
              {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
            </div>

            <div>
              <Controller
                name='password'
                control={control}
                rules={{ required: 'Vui lòng nhập mật khẩu' }}
                render={({ field }) => (
                  <PasswordInput
                    id='password'
                    placeholder='Mật khẩu'
                    error={errors.password}
                    innerRef={field.ref}
                    isInvalid={errors.password}
                    value={field.value}
                    onChange={field.onChange}
                    errors={errors.password?.message}
                  />
                )}
              />
              {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
            </div>
          </div>

          <div className='flex flex-col items-center gap-6 mt-4 mb-10 pt-12'>
            <button
              type='submit'
              className='w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg'
            >
              Đăng ký
            </button>
            {apiError && <p className='text-red-500 text-sm'>{apiError}</p>}
          </div>
        </form>

        <div className='flex items-center gap-4 my-6'>
          <div className='flex-1 h-px bg-gray-300' />
          <span className='text-sm text-gray-500 font-medium'>hoặc</span>
          <div className='flex-1 h-px bg-gray-300' />
        </div>
        <GoogleSignIn />
        <div className='flex justify-center gap-2.5 leading-none pt-4'>
          <p>Đã có tài khoản?</p>
          <NavLink to='/v1/login' className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Đăng nhập
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Register;
