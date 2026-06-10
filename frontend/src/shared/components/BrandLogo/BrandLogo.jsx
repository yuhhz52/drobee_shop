import React from 'react';
import { Link } from 'react-router-dom';
import './BrandLogo.css';

const BrandLogo = ({ className = '', linkClassName = '', asLink = true }) => {
  const logo = (
    <span className={`horizon-logo-mark ${className}`.trim()} aria-label="Horizon">
      <span className="horizon-logo-mark__v">H</span>
      <span className="horizon-logo-mark__text">ORIZON</span>
    </span>
  );

  if (!asLink) return logo;

  return (
    <Link
      to="/"
      className={`zentro-logo-link ${linkClassName}`.trim()}
      aria-label="Horizon - Home"
    >
      {logo}
    </Link>
  );
};

export default BrandLogo;
