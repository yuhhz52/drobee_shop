import React from 'react'
import Navigation from '../components/Navigation/Navigation'
import { Outlet } from 'react-router-dom'
import BckgImage from '../assets/images/bg-1.png'
import { useSelector } from 'react-redux';
import Spinner from '../components/Spinner/Spinner';
import { useWindowSize } from 'react-use';
import media from '../assets/images/login.webp';

const AutheticationWrapper = () => {
  const {width} = useWindowSize();
    const isLoading = useSelector((state) => state.commonState.isLoading)
  return (
    <div>
        <div className='flex-1 grid grid-cols-1 lg:grid-cols-2 4xl:grid-cols-[minmax(0,_1030px)_minmax(0,_1fr)]'>
            {
                width >= 1024 &&
                <div className="flex flex-col justify-center items-center lg:p-[60px]">
                    <div className="w-[60px] text-[28px]"/>
                    <p className="text-center tracking-[0.2px] font-semibold text-lg leading-6 max-w-[540px] my-7 mx-auto">
                        Gain data-based insights, view progress at a glance, and manage your organization smarter
                    </p>
                    <img className="max-w-[780px]" src={media} alt="media"/>
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