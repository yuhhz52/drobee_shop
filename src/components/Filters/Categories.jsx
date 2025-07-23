import React from 'react'

const Categories = ({types, selectedTypes = [], onTypeChange}) => {
  return (
    <div className='space-y-2'>
      {types?.map(type => {
        const typeId = type.id || type.type_id;
        const checked = selectedTypes.includes(String(typeId));
        return (
          <div key={type?.id || type?.code} className='flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors'>
            <input 
              type='checkbox' 
              name={type?.id || type?.code} 
              id={type?.id || type?.code}
              className='border rounded w-4 h-4 accent-black text-black cursor-pointer'
              checked={checked}
              onChange={() => onTypeChange(String(typeId))}
            />
            <label 
              htmlFor={type?.code || type?.id} 
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