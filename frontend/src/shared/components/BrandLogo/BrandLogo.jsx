import React from 'react';
import { Link } from 'react-router-dom';
import './BrandLogo.css';

const BrandLogo = ({ className = '', linkClassName = '', asLink = true }) => {
  const logo = (
    <span className={`vepace-logo-mark ${className}`.trim()} aria-label="VEPACE">
      <span className="vepace-logo-mark__v">V</span>
      <span className="vepace-logo-mark__text">EPACE</span>
    </span>
  );

  if (!asLink) return logo;

  return (
    <Link
      to="/"
      className={`zentro-logo-link ${linkClassName}`.trim()}
      aria-label="VEPACE - Home"
    >
      {logo}
    </Link>
  );
};

export default BrandLogo;
