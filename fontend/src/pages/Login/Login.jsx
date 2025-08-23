import React, { useCallback, useEffect, useState } from 'react'
import GoogleSignIn from '../../components/Button/GoogleSignIn.jsx'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { setLoading } from '../../store/features/common';
import { loginAPI } from '../../api/authencation.js';
import { saveTokens } from '../../utils/jwt-helper';
import { Controller, useForm } from 'react-hook-form';
import PasswordInput from '../../components/PasswordInput.jsx';

const Login = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const verifiedSuccess = searchParams.get('verified') === 'success';
  const [showToast, setShowToast] = useState(verifiedSuccess);

  useEffect(() => {
    const hasVerified = sessionStorage.getItem('verifiedSuccess') === 'true';

    if (hasVerified) {
      setShowToast(true);
      sessionStorage.removeItem('verifiedSuccess'); // xoá sau khi đã dùng

      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const { register, handleSubmit, formState: { errors }, control } = useForm({
    defaultValues: {
      userName: '',
      password: '',
    },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = useCallback(
    async (data) => {
      dispatch(setLoading(true));
      try {
        const res = await loginAPI(data);

        // tuỳ backend trả về token như thế nào
        if (res?.accessToken) {
          saveTokens(res.accessToken, res.refreshToken);
          navigate('/');
        } else if (res?.token) {
          // fallback nếu BE trả về "token"
          saveTokens(res.token, res.refreshToken);
          navigate('/');
        } else {
          throw new Error('Something went wrong');
        }
      } catch {
        alert('Invalid credentials');
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate]
  );

  const handlePasswordReminder = (e) => {
    e.preventDefault();
  };

  return (
    <div className="bg-widget flex items-center justify-center w-full py-10 px-4 lg:p-[110px]">
      {showToast && (
        <div className="fixed top-2 right-2 z-50 flex items-start gap-3 bg-green-50 border-l-4 border-green-600 text-green-800 px-4 py-3 rounded-md shadow-md w-[320px] animate-fade-in">
          <svg
            className="w-6 h-6 mt-1 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1 text-left">
            <p className="font-semibold mb-1">Thành công</p>
            <p className="text-sm">Tài khoản đã được xác thực! Hãy đăng nhập để tiếp tục.</p>
          </div>
        </div>
      )}

      <div className="max-w-[460px] w-full">
        <div className="flex flex-col gap-2.5 text-center">
          <h1 className="text-4xl font-bold">Chào mừng trở lại!</h1>
          <p className="lg:max-w-[300px] m-auto 4xl:max-w-[unset]">
            Hãy đăng nhập để tiếp tục mua sắm và quản lý đơn hàng của bạn.
          </p>
        </div>

        <form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="font-bold text-[14px] pb-2 text-gray-500 w-fit"
              >
                Email
              </label>
              <input
                type="text"
                placeholder="Địa chỉ email"
                className={`h-[48px] w-full border p-2 ${
                  errors.userName ? 'border-red-500' : 'border-gray-400'
                }`}
                {...register('userName', {
                  required: 'Vui lòng nhập địa chỉ email',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Vui lòng nhập địa chỉ email hợp lệ',
                  },
                })}
              />
              {errors.userName && (
                <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Controller
                name="password"
                control={control}
                rules={{ required: 'Vui lòng nhập mật khẩu' }}
                render={({ field }) => (
                  <PasswordInput
                    id="password"
                    placeholder="Mật khẩu"
                    error={errors.password}
                    innerRef={field.ref}
                    isInvalid={errors.password}
                    value={field.value}
                    onChange={field.onChange}
                    errors={errors.password?.message}
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-6 mt-4 mb-10">
            <button
              type="button"
              onClick={handlePasswordReminder}
              className="hover:text-blue-500 font-medium"
            >
              Quên mật khẩu?
            </button>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        {/* Social Login */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500 font-medium">hoặc</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>
        <GoogleSignIn />

        <div className="flex justify-center gap-2.5 leading-none pt-4">
          <p>Bạn chưa có tài khoản?</p>
          <NavLink
            to="/v1/register"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <span className="hover:text-blue-500">Tạo tài khoản ngay</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Login;
