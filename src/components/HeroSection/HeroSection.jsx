import React from 'react';
import Slider from 'react-slick';
import banner1 from '../../assets/images/banner1.png';
import banner2 from '../../assets/images/banner2.png';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 z-20 cursor-pointer text-white text-xl md:text-3xl"
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
      className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 z-20 cursor-pointer text-white text-xl md:text-3xl"
      onClick={onClick}
      aria-label="Previous Slide"
    >
      ❮
    </div>
  );
};

const HeroSection = () => {
  const banners = [banner1, banner2];

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="relative w-full overflow-hidden">
  <Slider {...settings}>
    {banners.map((img, idx) => (
      <div key={idx} className="!w-full">
        <div
          className="w-full h-[30vh] md:h-[40vh] lg:h-[70vh] bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${img})` }}
          tabIndex={-1}
        ></div>
      </div>
    ))}
  </Slider>
</div>

  );
};

export default HeroSection;
