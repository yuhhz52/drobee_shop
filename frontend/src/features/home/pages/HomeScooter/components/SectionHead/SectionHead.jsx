import React from 'react';
import { Link } from 'react-router-dom';
import './SectionHead.css';

const SectionHead = ({
  title,
  linkText = 'View all',
  linkHref = '/products',
  centered = false,
  subtitle,
}) => {
  return (
    <div className={`horizon-section-head${centered ? ' horizon-section-head--center' : ''}`}>
      {subtitle ? (
        <div>
          <h2>{title}</h2>
          <p className="horizon-section-sub">{subtitle}</p>
        </div>
      ) : (
        <h2>{title}</h2>
      )}
      <Link to={linkHref} className="horizon-link-red">
        {linkText}
      </Link>
    </div>
  );
};

export default SectionHead;
