import React from 'react'
import Navigation from '../components/Navigation/Navigation.jsx'
import { Outlet } from 'react-router-dom'
import Spinner from '../components/Spinner/Spinner.jsx'
import { useSelector } from 'react-redux'
import Footer from '../components/Footer/Footer.jsx'
import content from '../data/content.json'
import ScrollToTop from '../components/ScrollToTop.jsx';

const LayoutShop = () => {
  const isLoading = useSelector((state) => state.commonState.isLoading)
  return (
    <div>
        <ScrollToTop />
        <Navigation />
        <main className="site-main">
          <Outlet />
        </main>
        <Footer content={content?.footer} />
        {isLoading && <Spinner />}
    </div>
  )
}

export default LayoutShop