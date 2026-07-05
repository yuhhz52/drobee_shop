import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './PriorityBanner.css';

const CDN = 'https://horizon.com/cdn/shop/files';

const PriorityBanner = () => {
  const { t } = useTranslation();
  return (
    <section className="horizon-priority">
      <div className="horizon-container horizon-priority__inner">
        <div className="horizon-priority__media">
          <img
            src={`${CDN}/free-helmet-horizon-store.jpg?v=1&width=900`}
            alt={t('priority.alt')}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/freebh.jpg';
            }}
          />
        </div>
        <div className="horizon-priority__content">
          <h2>{t('priority.title')}</h2>
          <p>
            {t('priority.body')}
          </p>
          <Link to="/products" className="horizon-btn horizon-btn--black">
            {t('priority.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PriorityBanner;
