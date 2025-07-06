import React from 'react'
import { Wishlist } from '../commom/Wishlist'
import { AccountIcon } from '../commom/AccountIcon'
import { CartIcon } from '../commom/CartIcon'
import { Link, NavLink} from 'react-router-dom'


const Navigation = ({variant = "default"}) => {
const navLinkClass = ({ isActive }) =>
    isActive ? 'text-black font-semibold border-b-2 border-black' : 'text-gray-600 hover:text-black';

  return (
    <nav className='flex items-center py-6 px-16 justify-between'>
      {/*Logo */}
      <div className='flex items-center'>
        <h2 className='text-3xl font-bold text-gray-800'><NavLink to='/'>Thanh Yuh</NavLink></h2>
      </div>


      {variant ==="default" && 
      <div className='flex flex-wrap items-center'>
      <ul className='flex gap-14'>
        <li><NavLink to='/' className={navLinkClass}>Home</NavLink></li>
        <li><NavLink to='/products' className={navLinkClass}>Women</NavLink></li>
        <li><NavLink to='/products1' className={navLinkClass}>Men</NavLink></li>
        <li><NavLink to='/contact' className={navLinkClass}>Contact</NavLink></li>
      </ul>
    </div>
    }

      {/* Search and Action Items */}
      
      <div className='flex items-center gap-6'>
        {/* Search Box */}
        {variant ==="default" && 
        <div className='flex items-center bg-gray-100 rounded-full px-4 py-1'>
          <svg className='h-5 w-5 text-gray-700 mr-2' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z' />
          </svg>
          <input
            type='text'
            className='bg-transparent outline-none text-sm'
            placeholder='Tìm kiếm'
          />
        </div>
    }
        {/* Action Icons */}
         {variant ==="default" && 
        <ul className='flex gap-4 items-center text-gray-600'>
          <li className='hover:text-black'><a href='/cart'><Wishlist /></a></li>
          <li className='hover:text-black'><a href='/login'><AccountIcon /></a></li>
          <li className='hover:text-black'><a href='/register'><CartIcon /></a></li>
        </ul>}

        {
          variant === "auth" && 
          <ul className='flex gap-8'>
            <li className='text-black border border-black hover:bg-slate-100 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none'><NavLink to={"/v1/login"} className={({isActive})=> isActive ? 'active-link':''}>Login</NavLink></li>
            <li className='text-black border border-black hover:bg-slate-100 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none'><NavLink to="/v1/register" className={({isActive})=> isActive ? 'active-link':''}>Signup</NavLink></li>
          </ul>
        }
      </div>
    </nav>
  )
}

export default Navigation
