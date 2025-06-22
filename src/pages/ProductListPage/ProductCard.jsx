import React from 'react'

const ProductCard = ({title, description, price, discount, rating, brand, thumbnail}) => {
  return (
    <div className='flex flex-col p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow bg-white'>
      <div className='relative overflow-hidden rounded-lg mb-3'>
        <img 
          className='h-48 sm:h-66 lg:h-52 xl:h-60 w-full object-cover hover:scale-105 cursor-pointer transition-transform duration-300' 
          width="220px" 
          height="280px" 
          src={thumbnail} 
          alt={title} 
        />
      
      </div>
      
      <div className='flex flex-col flex-1'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='text-sm sm:text-base font-medium text-gray-800 line-clamp-2 flex-1 pr-2'>{title}</h3>
          {brand && (
            <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap'>
              {brand}
            </span>
          )}
        </div>
        
        {description && (
          <p className='text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2'>{description}</p>
        )}
        
        <div className='flex justify-between items-center mt-auto'>
          <div className='flex items-center gap-2'>
            <span className='text-base sm:text-lg font-bold text-gray-900'>${price}</span>
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