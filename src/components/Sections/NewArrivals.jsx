import React from 'react'
import SeactionHeading from './SeactionHeading'
import Card from '../Cards/Card'
import Jeans from '../../assets/images/jeans.jpg'
import Shirt from '../../assets/images/shirts.jpg'
import Dress from '../../assets/images/dresses.jpg'
import Joggers from '../../assets/images/joggers.jpg'   
import Kurtis from '../../assets/images/kurtis.jpg'   
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import './NewArrivals.css'

const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      slidesToSlide: 5 // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 768 },
      items: 4,
      slidesToSlide: 4 // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 767, min: 464 },
      items: 2,
      slidesToSlide: 1 // optional, default to 1.
    }
  };

const items = [{
    imagePath: Jeans,
    title: 'Stylish Jeans'
    },{
    imagePath: Dress,
    title: 'Elegant Dress'
    }, {
    imagePath: Shirt,
    title: 'Casual Shirt'
    }, {
    imagePath: Joggers,
    title: 'Joggers'
    }, {
    imagePath: Kurtis,
    title: 'Casual Kurtis'
     }, {
    imagePath: Kurtis,
    title: 'Casual Kurtis'
    }, {
    imagePath: Kurtis,
    title: 'Casual Kurtis'
    }, {
    imagePath: Kurtis,
    title: 'Casual Kurtis'
    
}]
const NewArrivals = () => {
  return (
    <>
      <SeactionHeading title={'New Arrives'} />
       <Carousel
        responsive={responsive}
        autoPlay={false}
        swipeable={true}
        draggable={false}
        showDots={false}
        infinite={false}
        partialVisible={false}
        itemClass={'react-slider-custom-item'}
        className='px-6'
      >
        {items && items?.map((item,index)=> <Card key={item?.title +index} title={item.title} imagePath={item.imagePath}/>)}

      </Carousel>
  </>
  )
}

export default NewArrivals
