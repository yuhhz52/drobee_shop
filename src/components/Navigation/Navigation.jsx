import React from 'react'
import { Wishlist } from '../commom/Wishlist'
import { AccountIcon } from '../commom/AccountIcon'
import { CartIcon } from '../commom/CartIcon'
import { Link, NavLink, useNavigate} from 'react-router-dom'
import { useSelector } from 'react-redux'



const Navigation = ({variant = "default"}) => {
  const navLinkClass = ({ isActive }) =>
      isActive ? 'text-black font-semibold border-b-2 border-black' : 'text-gray-600 hover:text-black';
  const cartLength = useSelector(state => state.cartState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
  const navigate = useNavigate();
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
          <li><button><Wishlist/></button></li>
         <li><button onClick={()=> navigate('/account-details')}><AccountIcon/></button></li>
          <li><Link to='/cart-items' className='flex flex-wrap'><CartIcon />
          {cartLength > 0 && <div className='absolute ml-6 inline-flex items-center justify-center h-6 w-6 bg-black text-white rounded-full border-2 text-xs border-white'>{cartLength}</div>} 
          </Link></li>
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
