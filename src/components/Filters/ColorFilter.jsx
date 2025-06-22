import React, { useCallback, useState } from 'react';

export const colorSelector = {
    "Purple":"#8434E1",
    "Black":"#252525",
    "White":"#FFFFFF",
    "Gray": "#808080",
    "Blue": "#0000FF",
    "Red": "#FF0000",
    "Orange": "#FFA500",
    "Navy": "#000080",
    "Grey": "#808080",
    "Yellow": "#FFFF00",
    "Pink": "#FFC0CB",
    "Green": "#008000"
}

const ColorFilter = ({colors}) => {

  const [appliedColors,setAppliedColors] = useState([]);
  const onClickDiv = useCallback((item)=>{
    if(appliedColors.includes(item)){
      setAppliedColors(appliedColors?.filter(color => color !== item));
    }
    else{
      setAppliedColors([...appliedColors,item]);
    }
  },[appliedColors]);

  return (
    <div className='flex flex-col mb-4'>
        <p className='text-base font-medium text-gray-800 mb-4'>Colors</p>
        <div className='grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-3 px-2'>
            {colors?.map(item=> {
              return (
                <div key={item} className='flex flex-col items-center'>
                  <div 
                    className='w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-sm' 
                    onClick={()=>onClickDiv(item)} 
                    style={{
                      background:`${colorSelector[item]}`,
                      borderColor: appliedColors?.includes(item) ? '#000' : '#e5e7eb'
                    }}
                  />
                  <p 
                    className='text-xs sm:text-sm text-gray-500 mt-1 text-center' 
                    style={{color:`${appliedColors?.includes(item) ? 'black':''}`}}
                  >
                    {item}
                  </p>
                </div>
              )
            })}
        </div>
    </div>
  )
}

export default ColorFilter