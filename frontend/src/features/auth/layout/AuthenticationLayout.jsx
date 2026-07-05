import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '@shared/components/Spinner/Spinner';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import '@shared/styles/AuthPages.css';

const AutheticationWrapper = () => {
  const { t } = useTranslation();
  const isLoading = useSelector((state) => state.commonState.isLoading);

  return (
    <div className="horizon-auth-layout">
      <aside className="horizon-auth-brand">
        <div className="horizon-auth-brand__logo">{t('footer.brandFallback')}</div>
        <h2>{t('authLayout.tagline')}</h2>
        <p>{t('authLayout.description')}</p>
        <ul>
          <li>{t('authLayout.benefitHelmet')}</li>
          <li>{t('authLayout.benefitShipping')}</li>
          <li>{t('authLayout.benefitSupport')}</li>
          <li>{t('authLayout.benefitSecure')}</li>
        </ul>
        <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'underline' }}>
            {t('authLayout.backToStore')}
          </Link>
        </p>
      </aside>

      <div className="horizon-auth-panel">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="horizon-auth-mobile-logo">{t('footer.brandFallback')}</div>
          <Outlet />
        </div>
      </div>

      {isLoading && <Spinner />}
    </div>
  );
};

export default AutheticationWrapper;
