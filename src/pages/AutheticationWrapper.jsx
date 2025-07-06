import React from 'react'
import Navigation from '../components/Navigation/Navigation'
import { Outlet } from 'react-router-dom'
import BckgImage from '../assets/images/bg-1.png'
import { useSelector } from 'react-redux';
import Spinner from '../components/Spinner/Spinner';

const AutheticationWrapper = () => {
    const isLoading = useSelector((state) => state.commonState.isLoading)
  return (
    <div>
        <Navigation variant="auth"/>
        <div className='flex'>
            <div className='w-[50%] lg:w-[60%] hidden md:inline py-2'>
              <img src={BckgImage} className='bg-cover w-full bg-center' alt='shoppingimage'/>
            </div>
            <div>
            <Outlet />
            </div>
            {isLoading && <Spinner />}
        </div>
    </div>
  )
}

export default AutheticationWrapper