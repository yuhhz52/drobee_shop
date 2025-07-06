import React from 'react'
import Navigation from '../components/Navigation/Navigation'
import { Outlet } from 'react-router-dom'
import Spinner from '../components/Spinner/Spinner'
import { useSelector } from 'react-redux'

const ShopApplication = () => {
  const isLoading = useSelector((state) => state.commonState.isLoading)
  return (
    <div>
        <Navigation />
        <Outlet />
        {isLoading && <Spinner />}
    </div>
  )
}

export default ShopApplication