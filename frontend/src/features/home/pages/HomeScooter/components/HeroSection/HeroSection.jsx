import React, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './HeroSection.css';
import { fetchActiveBanners } from '@services/banner.service';

const HeroSection = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchActiveBanners();
      if (cancelled) return;
      const mapped = (Array.isArray(data) ? data : []).map((b) => ({
        image: b.imageUrl,
        link: b.linkUrl || '/products',
        alt: b.altText || b.title || 'Banner',
      }));
      setSlides(mapped);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const settings = {
    dots: true,
    arrows: false,
    infinite: slides.length > 1,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: slides.length > 1,
    autoplaySpeed: 5500,
  };

  const handlePrev = () => sliderRef.current?.slickPrev();
  const handleNext = () => sliderRef.current?.slickNext();

  if (loading) {
    return <div className="horizon-hero" aria-busy="true" />;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="horizon-hero">
      {slides.length > 1 && (
        <button
          type="button"
          className="horizon-hero__nav horizon-hero__nav--prev"
          aria-label="Previous slide"
          onClick={handlePrev}
        >
          <FiChevronLeft />
        </button>
      )}
      <Slider ref={sliderRef} {...settings}>
        {slides.map((slide, index) => (
          <div key={`${slide.link}-${index}`}>
            <Link to={slide.link} className="horizon-hero__slide">
              <img
                src={slide.image}
                alt={slide.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </Link>
          </div>
        ))}
      </Slider>
      {slides.length > 1 && (
        <button
          type="button"
          className="horizon-hero__nav horizon-hero__nav--next"
          aria-label="Next slide"
          onClick={handleNext}
        >
          <FiChevronRight />
        </button>
      )}
    </section>
  );
};

export default HeroSection;
