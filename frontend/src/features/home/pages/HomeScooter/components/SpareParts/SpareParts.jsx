import React from 'react';
import { Link } from 'react-router-dom';
import './SpareParts.css';

const SpareParts = () => {
  return (
    <section className="horizon-spare">
      <div className="horizon-container horizon-spare__inner">
        <div>
          <h2>Need Spare Parts?</h2>
          <p>
            Find official spare parts and replacement components, including tires,
            brakes, displays, chargers, and more. Fast shipping and compatible parts
            for your electric scooter.
          </p>
        </div>
        <Link to="/products" className="horizon-btn horizon-btn--outline">
          View Parts
        </Link>
      </div>
    </section>
  );
};

export default SpareParts;
