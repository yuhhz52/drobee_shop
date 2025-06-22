import React from 'react'

const Categories = ({types}) => {
  return (
    <div className='space-y-2'>
      {types?.map(type=>{
        return (
          <div key={type?.code} className='flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors'>
            <input 
              type='checkbox' 
              name={type?.code} 
              id={type?.code}
              className='border rounded w-4 h-4 accent-black text-black cursor-pointer'
            />
            <label 
              htmlFor={type?.code} 
              className='px-3 text-sm sm:text-base text-gray-600 cursor-pointer flex-1'
            >
              {type?.name}
            </label>
          </div>
        )
      })}
    </div>
  )
}

export default Categories