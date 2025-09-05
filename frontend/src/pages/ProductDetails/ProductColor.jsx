import React from 'react'
import { colorSelector } from '../../components/Filters/ColorFilter';

const ProductColor = ({ colors, selectedColor, onChange }) => {
  // Lọc ra các màu duy nhất
  const uniqueColors = Array.from(new Set(colors));

  return (
    <div className='flex pt-2'>
      {uniqueColors?.map((color, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onChange(color)}
          className={`rounded-[50%] w-6 h-6 mx-2 border-2 transition-all duration-150
            ${selectedColor === color ? 'border-black scale-110 ring-2 ring-black' : 'border-gray-300'}
          `}
          style={{ background: colorSelector[color] || color }}
          aria-label={color}
        />
      ))}
    </div>
  )
}

export default ProductColor