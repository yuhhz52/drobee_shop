import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './PromoStrip.css';

const PromoStrip = () => {
  const { t } = useTranslation();
  return (
    <section className="horizon-promo-strip">
      <div className="horizon-promo-strip__block horizon-promo-strip__block--dark">
        <p>{t('promo.warranty')}</p>
        <Link to="/contact" className="horizon-promo-strip__btn horizon-promo-strip__btn--red">
          {t('promo.warrantyBtn')}
        </Link>
      </div>
      <div className="horizon-promo-strip__block horizon-promo-strip__block--red">
        <p>{t('promo.shipping')}</p>
        <Link to="/contact" className="horizon-promo-strip__btn horizon-promo-strip__btn--dark">
          {t('promo.shippingBtn')}
        </Link>
      </div>
    </section>
  );
};

export default PromoStrip;
