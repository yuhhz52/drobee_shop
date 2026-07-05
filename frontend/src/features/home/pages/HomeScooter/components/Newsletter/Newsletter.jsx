import React from 'react';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './Newsletter.css';

const Newsletter = () => {
  const { t } = useTranslation();
  return (
    <section className="horizon-mid-newsletter">
      <div className="horizon-container horizon-mid-newsletter__inner">
        <h2>{t('newsletter.title')}</h2>
        <p>{t('newsletter.subtitle')}</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder={t('newsletter.placeholder')} aria-label={t('auth.email')} />
          <button type="submit" className="horizon-btn horizon-btn--red">
            {t('newsletter.subscribe')}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
