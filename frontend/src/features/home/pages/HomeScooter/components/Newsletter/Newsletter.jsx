import React from 'react';
import './Newsletter.css';

const Newsletter = () => {
  return (
    <section className="horizon-mid-newsletter">
      <div className="horizon-container horizon-mid-newsletter__inner">
        <h2>Newsletter</h2>
        <p>Join the Horizon Rider Family &amp; Stay Informed</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Your email" aria-label="Email" />
          <button type="submit" className="horizon-btn horizon-btn--red">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
