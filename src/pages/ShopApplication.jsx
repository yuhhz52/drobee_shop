import React from 'react'
import Navigation from '../components/Navigation/Navigation'
import { Outlet } from 'react-router-dom'

const ShopApplication = () => {

  return (
    <div>
        <Navigation />
        <Outlet />
    </div>
  )
}

export default ShopApplication