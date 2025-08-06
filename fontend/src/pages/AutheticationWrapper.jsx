import React from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux';
import Spinner from '../components/Spinner/Spinner';
import { useWindowSize } from 'react-use';
import media from '../assets/images/login_shopping.svg';

const AutheticationWrapper = () => {
  const {width} = useWindowSize();
    const isLoading = useSelector((state) => state.commonState.isLoading)
  return (
    <div>
        <div className='flex-1 grid grid-cols-1 lg:grid-cols-2'>
            {
                width >= 1024 &&
                <div className="flex flex-col justify-center items-center lg:p-[30px] bg-gray-100">
                    <div className="w-[60px] text-[28px]"/>
                    <p className="text-center tracking-[0.2px] font-semibold text-lg leading-6 max-w-[540px] my-7 mx-auto">
                       Trải nghiệm mua sắm thông minh – theo dõi đơn hàng,cùng ưu đãi và lịch sử giao dịch dễ dàng
                    </p>
                    <img className="w-full max-w-[790px] h-auto mx-auto" src={media} alt="media" />
                </div>
            }
            <div>
            <Outlet />
            </div>
            {isLoading && <Spinner />}
        </div>
    </div>
  )
}

export default AutheticationWrapper