import React from 'react';
import { Link } from 'react-router-dom';
import './PromoStrip.css';

const PromoStrip = () => {
  return (
    <section className="horizon-promo-strip">
      <div className="horizon-promo-strip__block horizon-promo-strip__block--dark">
        <p>1-2 year warranty &amp; after-sales service available 7/7</p>
        <Link to="/contact" className="horizon-promo-strip__btn horizon-promo-strip__btn--red">
          Warranty
        </Link>
      </div>
      <div className="horizon-promo-strip__block horizon-promo-strip__block--red">
        <p>Delivery to all EU countries, 3-7 working days</p>
        <Link to="/contact" className="horizon-promo-strip__btn horizon-promo-strip__btn--dark">
          Shipping
        </Link>
      </div>
    </section>
  );
};

export default PromoStrip;
