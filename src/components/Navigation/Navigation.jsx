import React from 'react'
import { Wishlist } from '../commom/Wishlist'
import { AccountIcon } from '../commom/AccountIcon'
import { CartIcon } from '../commom/CartIcon'

const Navigation = () => {
  return (
    <nav className='flex items-center py-6 px-16 justify-between'>
      {/*Logo */}
      <div className='flex items-center'>
        <h2 className='text-3xl font-bold text-gray-800'>Shop Ecom</h2>
      </div>

      {/* Navigation Items */}
      <div className='flex-1 flex justify-center'>
        <ul className='flex gap-10 text-gray-600 items-center'>
          <li className='hover:text-black'><a href='/'>Home</a></li>
          <li className='hover:text-black'><a href='/product'>Product</a></li>
          <li className='hover:text-black'><a href='/contact'>Contact</a></li>
          <li className='hover:text-black'><a href='/about'>About</a></li>
        </ul>
      </div>

      {/* Search and Action Items */}
      <div className='flex items-center gap-6'>
        {/* Search Box */}
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

        {/* Action Icons */}
        <ul className='flex gap-4 items-center text-gray-600'>
          <li className='hover:text-black'><a href='/cart'><Wishlist /></a></li>
          <li className='hover:text-black'><a href='/login'><AccountIcon /></a></li>
          <li className='hover:text-black'><a href='/register'><CartIcon /></a></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
