import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './SpareParts.css';

const SpareParts = () => {
  const { t } = useTranslation();
  return (
    <section className="horizon-spare">
      <div className="horizon-container horizon-spare__inner">
        <div>
          <h2>{t('spareParts.title')}</h2>
          <p>{t('spareParts.body')}</p>
        </div>
        <Link to="/products" className="horizon-btn horizon-btn--outline">
          {t('spareParts.cta')}
        </Link>
      </div>
    </section>
  );
};

export default SpareParts;
