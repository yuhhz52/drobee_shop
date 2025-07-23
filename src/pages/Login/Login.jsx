import React, {  useCallback, useState } from 'react'
import GoogleSignIn from '../../components/Button/GoogleSignIn.jsx' 
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { setLoading } from '../../store/features/common';
import { loginAPI } from '../../api/authencation.js';
import { saveToken } from '../../utils/jwt-helper';
import { Controller, useForm } from 'react-hook-form';
import PasswordInput from '../../components/PasswordInput.jsx';

const Login = () => {

     const {register,handleSubmit,formState: {errors}, control} = useForm({
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
        if (res?.token) {
          saveToken(res?.token);
          navigate('/');
        } else {
          throw new Error('Something went wrong');
        }
      } catch (error) {
        alert('Invalid credentials');
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate]
  );


    const handlePasswordReminder = e => {
      e.preventDefault();
    }

  return (
    <>
    <div className='bg-widget flex items-center justify-center w-full py-10 px-4 lg:p-[60px]'>
       <div className="max-w-[460px] w-full">
         <div className="flex flex-col gap-2.5 text-center">
            <h1 className="text-3xl font-bold">Chào mừng trở lại!</h1>
            <p className="lg:max-w-[300px] m-auto 4xl:max-w-[unset]">
                Cửa hàng trực tuyến của chúng tôi đã sẵn sàng để phục vụ bạn.
            </p>
        </div>
          <form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
             <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-[8px]">
                  <label htmlFor="email" className="font-bold text-[14px] text-gray-500 w-fit">Email</label>                 
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.userName.message}
                </p>)}</div>
        
                <div>
                 <Controller name="password"
                    control={control}
                    rules={{ required: 'Vui lòng nhập mật khẩu' }}
                    render={({field}) => (
                        <PasswordInput id="password"
                                        placeholder="Mât khẩu"
                                        error={errors.password}
                                        innerRef={field.ref}
                                        isInvalid={errors.password}
                                        value={field.value}
                                        onChange={field.onChange}
                                        errors={errors.password?.message}/>
                    )}/>
                    {errors.password && (
                  <p className="text-red-500 text-sm ">
                    {errors.password.message}
                  </p>)}</div>
              </div>
              <div className="flex flex-col items-center gap-6 mt-4 mb-10">
              <button type="button" onClick={handlePasswordReminder}
                className="text-blue-500 hover:underline font-medium">
                Quên mật khẩu?
              </button>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
                Đăng nhập
              </button>
            </div>
          </form>
         
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500 font-medium">hoặc</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          <GoogleSignIn />
          <div className="flex justify-center gap-2.5 leading-none pt-4">
                <p>Bạn chưa có tài khoản?</p>
                <NavLink to="/v1/register" className={({isActive})=> isActive ? 'active-link':''}>Đăng ký</NavLink>
          </div>
        </div>
        
    </div>
    

    </>
  )
}

export default Login