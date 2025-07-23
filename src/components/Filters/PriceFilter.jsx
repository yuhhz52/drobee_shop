import React, { useState } from 'react'
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import './PriceFilter.css';

const PriceFilter = ({ onChange }) => {
  const [range, setRange] = useState({ min: 10, max: 250 });
  const handleChange = (values) => {
    const newRange = { min: values[0], max: values[1] };
    setRange(newRange);
    onChange && onChange(newRange);
  };
  return (
    <div className='flex flex-col mb-4'>
        <p className='text-base font-medium text-gray-800 mb-4'>Price</p>
        <div className='px-2'>
          <RangeSlider 
            className={'custom-range-slider'} 
            min={0} 
            max={500} 
            defaultValue={[range.min,range.max]} 
            onInput = {handleChange}
          />
        </div>

        <div className='flex justify-between gap-3 mt-4'>
            <div className='border rounded-lg h-10 flex-1 flex items-center'>
              <p className='pl-3 text-gray-600 text-sm'>$</p> 
              <input 
                type='number' 
                value={range?.min} 
                className='outline-none px-2 text-gray-600 text-sm flex-1' 
                min={0} 
                max="499" 
                disabled 
                placeholder='min'
              />
            </div>
            <div className='border rounded-lg h-10 flex-1 flex items-center'>
              <p className='pl-3 text-gray-600 text-sm'>$</p> 
              <input 
                type='number' 
                value={range?.max} 
                className='outline-none px-2 text-gray-600 text-sm flex-1' 
                min={0} 
                max="500" 
                disabled 
                placeholder='max'
              />
            </div>
        </div>
    </div>
  )
}

export default PriceFilter