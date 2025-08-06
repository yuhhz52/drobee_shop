import React from 'react'
import ArrowIcon from '../commom/ArrowIcon'

const Card = ({imagePath,title,description,actionArrow,height,width}) => {
  return (
    <div className='flex flex-col p-8'>
      <img className={`h-[${height? height:'220px'}] max-h-[${height? height:'220px'}]
         rounded-lg hover:scale-105 cursor-pointer`} width={width??"200px"} height={height?? "220px"} src={imagePath} alt="Jeans" />
      <div className='flex justify-between items-center'>
        <div className='flex flex-col p-3'>
        <p className='text-[16px] p-[5px]'>{title}</p>
        {description && <p className='text-[13px] px-1 text-gray-600'>{description}</p>}
        </div>
        {actionArrow && <span className='cursor-pointer pr-2 items-center'><ArrowIcon/></span>}
      </div>
    </div>
  )
}

export default Card