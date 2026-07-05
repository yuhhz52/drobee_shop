import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcStripe,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './Footer.css';

const SOCIAL_ICON_MAP = {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
};

const PAYMENT_ICON_MAP = {
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcStripe,
  FaMoneyBillWave,
};

// Data-driven rows are still rendered from `content`, but every UI string now
// comes from the i18n dictionary. Brand name (HORIZON), payment-method names,
// address, phone, email, hours, and social names retain their original (brand /
// real-world) values per project convention.
const SHOP_LINKS = [
  { key: 'allProducts', path: '/products' },
  { key: 'electricScooters', path: '/collections/scooters' },
  { key: 'accessories', path: '/collections/accessories' },
  { key: 'newArrivals', path: '/collections/new' },
  { key: 'bestSellers', path: '/collections/best-sellers' },
];

const HELP_LINKS = [
  { key: 'aboutUs', path: '/about' },
  { key: 'contactLink', path: '/contact' },
  { key: 'shippingDelivery', path: '/shipping' },
  { key: 'returnsWarranty', path: '/returns' },
  { key: 'faq', path: '/faq' },
  { key: 'privacyPolicy', path: '/privacy' },
  { key: 'termsOfService', path: '/terms' },
];

const Footer = ({ content }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  if (!content) return null;

  const contact = content.contact || {};
  const socialLinks = content.socialLinks || [];
  const paymentMethods = content.paymentMethods || [];

  const handleSubscribe = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!emailValid) {
      setStatus({ type: 'error', message: t('newsletter.invalidEmail') });
      return;
    }

    setStatus({ type: 'success', message: t('newsletter.thanks') });
    setEmail('');
  };

  return (
    <footer className="horizon-footer">
      <div className="horizon-footer__inner">
        <div className="horizon-footer__grid">
          <div className="horizon-footer__col horizon-footer__col--brand">
            <h4 className="horizon-footer__brand-name">
              {content.brand?.name || t('footer.brandFallback')}
            </h4>
            <p className="horizon-footer__tagline">{t('footer.brandTagline')}</p>
            <p className="horizon-footer__description">{t('footer.brandDescription')}</p>

            {socialLinks.length > 0 && (
              <div className="horizon-footer__socials" aria-label={t('footer.socialMedia')}>
                {socialLinks.map((item) => {
                  const Icon = SOCIAL_ICON_MAP[item.icon];
                  if (!Icon) return null;
                  return (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="horizon-footer__social-link"
                      aria-label={item.name}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="horizon-footer__col">
            <h4>{t('footer.shop')}</h4>
            <ul>
              {SHOP_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{t(`footer.shopLinks.${link.key}`)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="horizon-footer__col">
            <h4>{t('footer.helpAndInfo')}</h4>
            <ul>
              {HELP_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{t(`footer.helpLinks.${link.key}`)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="horizon-footer__col">
            <h4>{t('footer.contact')}</h4>
            <ul className="horizon-footer__contact-list">
              {contact.address && (
                <li>
                  <FaMapMarkerAlt className="horizon-footer__contact-icon" aria-hidden="true" />
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li>
                  <FaPhoneAlt className="horizon-footer__contact-icon" aria-hidden="true" />
                  <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a>
                </li>
              )}
              {contact.email && (
                <li>
                  <FaEnvelope className="horizon-footer__contact-icon" aria-hidden="true" />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
              {contact.hours && (
                <li>
                  <FaClock className="horizon-footer__contact-icon" aria-hidden="true" />
                  <span>{contact.hours}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="horizon-footer__col horizon-footer__col--newsletter">
            <h4>{t('newsletter.title')}</h4>
            <p className="horizon-footer__newsletter-lead">{t('newsletter.subtitle')}</p>
            <form onSubmit={handleSubscribe} noValidate>
              <div className="horizon-footer__newsletter-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status.type !== 'idle') setStatus({ type: 'idle', message: '' });
                  }}
                  placeholder={t('newsletter.placeholder')}
                  aria-label={t('footer.email')}
                  required
                />
                <button
                  type="submit"
                  className="horizon-footer__subscribe"
                  aria-label={t('newsletter.subscribe')}
                >
                  <FaPaperPlane />
                </button>
              </div>
              {status.message && (
                <p
                  className={`horizon-footer__newsletter-status horizon-footer__newsletter-status--${status.type}`}
                  role={status.type === 'error' ? 'alert' : 'status'}
                >
                  {status.message}
                </p>
              )}
            </form>

            {paymentMethods.length > 0 && (
              <div className="horizon-footer__payments" aria-label={t('footer.payments')}>
                <span className="horizon-footer__payments-label">{t('footer.weAccept')}</span>
                <div className="horizon-footer__payments-icons">
                  {paymentMethods.map((method) => {
                    const Icon = PAYMENT_ICON_MAP[method.icon];
                    if (!Icon) return null;
                    return (
                      <span
                        key={method.name}
                        className="horizon-footer__payment-icon"
                        title={method.name}
                        aria-label={method.name}
                      >
                        <Icon />
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="horizon-footer__bottom">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;