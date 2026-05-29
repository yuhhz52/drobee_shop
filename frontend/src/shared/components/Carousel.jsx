import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 z-20 cursor-pointer text-gray-400 text-xl md:text-3xl hover:text-gray-600"
      onClick={onClick}
      aria-label="Next Slide"
    >
      ❯
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 z-20 cursor-pointer text-gray-400 text-xl md:text-3xl  hover:text-gray-600"
      onClick={onClick}
      aria-label="Previous Slide"
    >
      ❮
    </div>
  );
};

const Carousel = ({ children, settings = {} }) => {
  const defaultSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5, 
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 4 }
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 2 }
      }
    ]
  };

  const finalSettings = { ...defaultSettings, ...settings };

  return (
    <Slider {...finalSettings} className="w-full pb-5">
      {children}
    </Slider>
  );
};

export default Carousel;
