import React from 'react'
import SeactionHeading from './SeactionHeading'
import Card from '../Cards/Card'

const Category = ({ title, data }) => {
  return (
    <>
      <SeactionHeading title={title} />
      <div className="flex flex-wrap px-8">
        {data && data.map((item, index) => (
          <Card 
            key={index}
            title={item?.title} 
            description={item?.description} 
            imagePath={item?.image} 
            actionArrow={true}
            height={'280px'}
          />
        ))}
      </div>
    </>
  )
}

export default Category