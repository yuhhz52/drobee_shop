import React from 'react';

const Categories = ({ types = [], selectedTypes = [], onTypeChange }) => {
  return (
    <div className='space-y-2'>
      {types.map((type) => {
        const typeId = String(type?.id || type?.type_id);
        const isChecked = selectedTypes.includes(typeId);

        return (
          <div
            key={typeId}
            className='flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors'
          >
            <input
              type='checkbox'
              name={`type-${typeId}`}
              id={`type-${typeId}`}
              className='border rounded w-4 h-4 accent-black text-black cursor-pointer'
              checked={isChecked}
              onChange={() => onTypeChange(typeId)}
            />
            <label
              htmlFor={`type-${typeId}`}
              className='px-3 text-sm sm:text-base text-gray-600 cursor-pointer flex-1'
            >
              {type?.name}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default Categories;

