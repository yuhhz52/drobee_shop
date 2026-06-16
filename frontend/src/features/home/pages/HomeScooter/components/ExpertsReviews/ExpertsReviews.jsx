import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './ExpertsReviews.css';

const fallbackReviews = [
  {
    title: 'Best Electric Scooters 2025 - We Tested 200+ To Find Out!',
    videoId: '4UBR-UQbIag',
  },
  {
    title: 'Xiaomi 4 Pro 2nd Gen Review 2024',
    videoId: 'n_q3Z8-DV24',
  },
  {
    title: 'Segway Ninebot Max G30P - Full Review',
    videoId: 'EHnErMI8Cgg',
  },
  {
    title: 'Dualtron Thunder - Ultimate Power Scooter Review',
    videoId: 'Z5DdYqTV8ps',
  },
  {
    title: 'Xiaomi M365 Pro - Honest Long Term Review',
    videoId: 'xQReCpjDZkM',
  },
  {
    title: 'Gotrax G4 - Best Budget Electric Scooter 2024',
    videoId: '4x3w6AmqX_4',
  },
];

const ExpertsReviews = ({ reviews = fallbackReviews }) => {
  const [expertDot, setExpertDot] = useState(0);

  const handlePrev = () => {
    const track = document.querySelector('.horizon-experts__track');
    const firstCard = track?.querySelector('.horizon-experts__card');
    if (track && firstCard) {
      const cardWidth = firstCard.offsetWidth + 16;
      track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      setExpertDot((d) => Math.max(0, d - 1));
    }
  };

  const handleNext = () => {
    const track = document.querySelector('.horizon-experts__track');
    const firstCard = track?.querySelector('.horizon-experts__card');
    if (track && firstCard) {
      const cardWidth = firstCard.offsetWidth + 16;
      track.scrollBy({ left: cardWidth, behavior: 'smooth' });
      setExpertDot((d) => Math.min(3, d + 1));
    }
  };

  const handleDotClick = (index) => {
    const track = document.querySelector('.horizon-experts__track');
    const firstCard = track?.querySelector('.horizon-experts__card');
    if (track && firstCard) {
      const cardWidth = firstCard.offsetWidth + 16;
      track.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
      setExpertDot(index);
    }
  };

  return (
    <section className="horizon-section horizon-section--experts">
      <div className="horizon-container">
        <div className="horizon-section-head horizon-section-head--center">
          <div>
            <h2>Tested by Experts</h2>
            <p className="horizon-section-sub">
              Watch honest reviews from YouTube creators and tech reviewers before
              choosing your ride.
            </p>
          </div>
        </div>
        <div className="horizon-experts">
          <button
            type="button"
            className="horizon-experts__arrow horizon-experts__arrow--prev"
            aria-label="Previous"
            onClick={handlePrev}
          >
            <FiChevronLeft />
          </button>
          <div className="horizon-experts__track">
            {reviews.map((review, idx) => (
              <a
                key={review.videoId + idx}
                href={`https://www.youtube.com/watch?v=${review.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="horizon-experts__card"
              >
                <div className="horizon-experts__thumb">
                  <img
                    src={`https://img.youtube.com/vi/${review.videoId}/hqdefault.jpg`}
                    alt={review.title}
                  />
                  <span className="horizon-experts__play" aria-hidden="true" />
                </div>
                <h3>{review.title}</h3>
              </a>
            ))}
          </div>
          <button
            type="button"
            className="horizon-experts__arrow horizon-experts__arrow--next"
            aria-label="Next"
            onClick={handleNext}
          >
            <FiChevronRight />
          </button>
        </div>
        <div className="horizon-experts__dots">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              className={expertDot === i ? 'is-active' : ''}
              aria-label={`Page ${i + 1}`}
              onClick={() => handleDotClick(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertsReviews;
