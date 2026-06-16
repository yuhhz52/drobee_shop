import React from 'react';
import { Link } from 'react-router-dom';
import './PriorityBanner.css';

const CDN = 'https://horizon.com/cdn/shop/files';

const PriorityBanner = () => {
  return (
    <section className="horizon-priority">
      <div className="horizon-container horizon-priority__inner">
        <div className="horizon-priority__media">
          <img
            src={`${CDN}/free-helmet-horizon-store.jpg?v=1&width=900`}
            alt="Free helmet with every scooter"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/freebh.jpg';
            }}
          />
        </div>
        <div className="horizon-priority__content">
          <h2>Your Ride, Our Priority.</h2>
          <p>
            At Horizon, your safety comes first. That&apos;s why we offer a{' '}
            <strong>free helmet with every electric scooter purchase</strong> — because
            we&apos;re committed to protecting our riders and supporting every journey with
            care and confidence.
          </p>
          <Link to="/products" className="horizon-btn horizon-btn--black">
            Explore Our Scooters
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PriorityBanner;
