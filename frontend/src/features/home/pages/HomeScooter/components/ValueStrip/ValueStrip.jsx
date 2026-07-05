import React from 'react';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './ValueStrip.css';

const ValueStrip = ({ items }) => {
  const { t } = useTranslation();
  const valueProps = items ?? [
    { title: t('value.euShipping.title'), text: t('value.euShipping.text') },
    { title: t('value.freeHelmet.title'), text: t('value.freeHelmet.text') },
    { title: t('value.support.title'), text: t('value.support.text') },
    { title: t('value.payments.title'), text: t('value.payments.text') },
  ];
  return (
    <section className="horizon-value-strip">
      <div className="horizon-container horizon-value-strip__grid">
        {valueProps.map((prop) => (
          <div key={prop.title}>
            <h4>{prop.title}</h4>
            <p>{prop.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValueStrip;
