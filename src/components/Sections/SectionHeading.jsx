import React from 'react'
import Card from '../Cards/Card'

const SectionHeading = ({title}) => {
  return (
    <>
      <div className='flex flex-wrap px-5 md:px-12 lg:px-15 my-5 items-center gap-2'>
        <p className='text-2xl'> {title} </p>
      </div>   
    </>
  )
}

export default SectionHeading 