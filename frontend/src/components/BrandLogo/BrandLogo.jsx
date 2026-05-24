import React from 'react';
import { Link } from 'react-router-dom';
import './BrandLogo.css';

const BrandLogo = ({ className = '', linkClassName = '', asLink = true }) => {
  const logo = (
    <span className={`zentro-logo ${className}`.trim()} aria-label="Zentro">
      Zentro
    </span>
  );

  if (!asLink) return logo;

  return (
    <Link
      to="/"
      className={`zentro-logo-link ${linkClassName}`.trim()}
      aria-label="Zentro - Trang chủ"
    >
      {logo}
    </Link>
  );
};

export default BrandLogo;
