import React from 'react'
import { Link } from 'react-router-dom'
import { formatDisplayPrice } from '../../utils/price-format'

const ProductCard = ({ name, price, discount, rating, brand, thumbnail, newArrival, slug }) => {
  return (
    <div className='flex flex-col p-2 sm:p-3 h-90  md:h-110 lg:h-88 xl:h-90 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow bg-white'>
      <Link to={`/product/${slug}`}>
        <div className='relative overflow-hidden rounded-lg mb-3'>
          {newArrival && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded z-1 shadow">
              Hàng mới
            </div>
          )}
          <img
            className='h-60 md:h-82 lg:h-56 xl:h-60 w-full object-cover hover:scale-105 cursor-pointer transition-transform duration-300 '
            width="220px"
            height="280px"
            src={thumbnail}
            alt={name}
          />
        </div>
      </Link>
      <div className='flex flex-col flex-1'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='text-sm sm:text-base font-medium text-gray-800 line-clamp-2 flex-1 pr-2'>{name}</h3>
          {brand && (
            <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap'>
              {brand}
            </span>
          )}
        </div>

        <div className='flex justify-between items-center mt-auto'>
          <div className='flex items-center gap-2'>
            <span className='text-base sm:text-lg font-bold text-gray-900'>{formatDisplayPrice(price)}</span>
            {discount && (
              <span className='text-xs sm:text-sm text-green-600 font-medium'>
                {discount}% OFF
              </span>
            )}
          </div>
          {rating && (
            <div className='flex items-center gap-1'>
              <span className='text-yellow-400 text-sm'>★</span>
              <span className='text-xs sm:text-sm text-gray-600'>{rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard