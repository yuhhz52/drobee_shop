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

const Footer = ({ content }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  if (!content) return null;

  const newsletter = content.newsletter || {};
  const shop = content.shop || {};
  const help = content.help || {};
  const contact = content.contact || {};
  const socialLinks = content.socialLinks || [];
  const paymentMethods = content.paymentMethods || [];

  const handleSubscribe = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!emailValid) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setStatus({ type: 'success', message: 'Thanks for subscribing!' });
    setEmail('');
  };

  return (
    <footer className="horizon-footer">
      <div className="horizon-footer__inner">
        <div className="horizon-footer__grid">
          <div className="horizon-footer__col horizon-footer__col--brand">
            <h4 className="horizon-footer__brand-name">
              {content.brand?.name || 'HORIZON'}
            </h4>
            {content.brand?.tagline && (
              <p className="horizon-footer__tagline">{content.brand.tagline}</p>
            )}
            {content.brand?.description && (
              <p className="horizon-footer__description">{content.brand.description}</p>
            )}

            {socialLinks.length > 0 && (
              <div className="horizon-footer__socials" aria-label="Social media">
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
            <h4>{shop.title || 'Shop'}</h4>
            <ul>
              {(shop.links || []).map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="horizon-footer__col">
            <h4>{help.title || 'Help & Info'}</h4>
            <ul>
              {(help.links || []).map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="horizon-footer__col">
            <h4>Contact</h4>
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
            <h4>{newsletter.title || 'NEWSLETTER'}</h4>
            {newsletter.lead && <p className="horizon-footer__newsletter-lead">{newsletter.lead}</p>}
            <form onSubmit={handleSubscribe} noValidate>
              <div className="horizon-footer__newsletter-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status.type !== 'idle') setStatus({ type: 'idle', message: '' });
                  }}
                  placeholder={newsletter.placeholder || 'Your email'}
                  aria-label="Email"
                  required
                />
                <button
                  type="submit"
                  className="horizon-footer__subscribe"
                  aria-label={newsletter.buttonLabel || 'Subscribe'}
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
              <div className="horizon-footer__payments" aria-label="Accepted payment methods">
                <span className="horizon-footer__payments-label">We accept</span>
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
          <p>{content.copyright || `(c) ${new Date().getFullYear()} Horizon Shop. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
