import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './SectionHead.css';

const SectionHead = ({
  title,
  linkText,
  linkHref = '/products',
  centered = false,
  subtitle,
}) => {
  const { t } = useTranslation();
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
        {linkText ?? t('common.viewAll')}
      </Link>
    </div>
  );
};

export default SectionHead;
