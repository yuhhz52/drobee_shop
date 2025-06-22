import React, { useCallback, useEffect, useState } from 'react'

const SizeFilter = ({sizes,hidleTitle,multi=true,onChange}) => {

  const [appliedSize,setAppliedSize] = useState([]);
  const onClickDiv = useCallback((item)=>{
    if(appliedSize.indexOf(item) > -1){  
      setAppliedSize(appliedSize?.filter(size => size !== item));
    }
    else{
      if(multi){
        setAppliedSize([...appliedSize,item]);
      }
      else{
        setAppliedSize([item]);
      }
    }
  },[appliedSize, multi]);

  useEffect(()=>{
    onChange && onChange(appliedSize);
  },[appliedSize, onChange])

  return (
    <div className={`flex flex-col ${hidleTitle?'':'mb-4'}`}>
        {!hidleTitle && <p className='text-base font-medium text-gray-800 mb-4'>Size</p>}
        <div className='grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2 px-2'>
            {sizes?.map((item,index)=> {
              return (
                <div key={index} className='flex justify-center'>
                  <div 
                    className='w-12 h-10 sm:w-14 sm:h-12 border text-center rounded-lg cursor-pointer
                     hover:scale-105 transition-all bg-white border-gray-300 text-gray-600 text-sm sm:text-base font-medium' 
                    style={appliedSize?.includes(item)?{
                      background:'black',
                      color:'white',
                      borderColor: 'black'
                    }:{}}
                    onClick={()=> onClickDiv(item)}
                  >
                    {item}
                  </div>
                </div>
              )
            })}
        </div>
    </div>
  )
}

export default SizeFilter