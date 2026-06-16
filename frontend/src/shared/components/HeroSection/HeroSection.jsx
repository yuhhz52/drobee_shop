import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchActiveBanners } from '@services/banner.service';

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
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchActiveBanners();
      if (!cancelled) {
        setBanners(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const settings = {
    dots: false,
    infinite: banners.length > 1,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: banners.length > 1,
    autoplaySpeed: 3000,
    arrows: banners.length > 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  if (loading) {
    return <div className="w-full h-[30vh] md:h-[40vh] lg:h-[70vh] bg-gray-100" aria-busy="true" />;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="!w-full">
            {banner.linkUrl ? (
              <a href={banner.linkUrl} aria-label={banner.altText || banner.title}>
                <div
                  className="w-full h-[30vh] md:h-[40vh] lg:h-[70vh] bg-center bg-cover bg-no-repeat"
                  style={{ backgroundImage: `url(${banner.imageUrl})` }}
                  tabIndex={-1}
                />
              </a>
            ) : (
              <div
                className="w-full h-[30vh] md:h-[40vh] lg:h-[70vh] bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url(${banner.imageUrl})` }}
                role="img"
                aria-label={banner.altText || banner.title}
                tabIndex={-1}
              />
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSection;
