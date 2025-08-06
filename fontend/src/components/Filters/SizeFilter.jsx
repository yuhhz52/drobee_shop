import React, { useCallback, useState } from 'react';

const SizeFilter = ({ sizes, hideTitle, onChange }) => {
  const [selectedSize, setSelectedSize] = useState('');

  const onClickDiv = useCallback((item) => {
    const newSize = selectedSize === item ? '' : item;
    setSelectedSize(newSize);
    onChange && onChange(newSize);
  }, [selectedSize, onChange]);

  return (
    <div className={`flex flex-col ${hideTitle ? '' : 'mb-2'}`}>
      {!hideTitle && <p className='text-[14px] text-black mt-2 mb-2'>Size</p>}
      <div className='flex flex-wrap px-2'>
        {sizes?.map((item, index) => (
          <div key={index} className='flex flex-col mr-2'>
            <div
              className='w-[50px] border text-center mb-4 rounded-lg mr-4 cursor-pointer
                hover:scale-110 bg-white border-gray-500 text-gray-500'
              style={selectedSize === item ? {
                background: 'black',
                color: 'white'
              } : {}}
              onClick={() => onClickDiv(item)}
            >
              {item}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SizeFilter;