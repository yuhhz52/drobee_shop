import React, { useState } from 'react';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaPaperPlane,
} from 'react-icons/fa';
import content from '@data/static/content.json';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './Contact.css';

const SOCIAL_ICONS = {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
};

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: 'general',
  message: '',
  agree: false,
};

const SUBJECT_KEYS = [
  { value: 'general', key: 'contact.subjects.general' },
  { value: 'sales', key: 'contact.subjects.sales' },
  { value: 'support', key: 'contact.subjects.support' },
  { value: 'warranty', key: 'contact.subjects.warranty' },
  { value: 'partnership', key: 'contact.subjects.partnership' },
];

const Contact = () => {
  const { t } = useTranslation();
  const contact = content?.footer?.contact ?? {};
  const socialLinks = content?.footer?.socialLinks ?? [];
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', text: '' });

  const update = (field) => (event) => {
    const value =
      event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t('contact.errors.nameRequired');
    if (!form.email.trim()) {
      next.email = t('contact.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = t('contact.errors.emailInvalid');
    }
    if (form.phone && !/^[0-9+()\-\s]{6,20}$/.test(form.phone.trim())) {
      next.phone = t('contact.errors.phoneInvalid');
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      next.message = t('contact.errors.messageTooShort');
    }
    if (!form.agree) {
      next.agree = t('contact.errors.agreeRequired');
    }
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({ type: 'error', text: t('contact.status.fixFields') });
      return;
    }
    setStatus({
      type: 'success',
      text: t('contact.status.success'),
    });
    setForm(initialForm);
  };

  return (
    <div className="horizon-contact">
      <section className="horizon-contact-hero">
        <div className="horizon-contact-hero__inner">
          <span className="horizon-contact-eyebrow">{t('contact.eyebrow')}</span>
          <h1 className="horizon-contact-title">{t('contact.title')}</h1>
          <p className="horizon-contact-lead">{t('contact.lead')}</p>
        </div>
      </section>

      <section className="horizon-contact-info">
        <div className="horizon-contact-info__grid">
          <a
            className="horizon-contact-card"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              contact.address || 'Horizon Shop',
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="horizon-contact-card__icon">
              <FaMapMarkerAlt />
            </span>
            <h3>{t('contact.showroom')}</h3>
            <p>{contact.address || t('contact.defaultAddress')}</p>
            <span className="horizon-contact-card__hint">{t('contact.openInMaps')}</span>
          </a>

          <a className="horizon-contact-card" href={`tel:${(contact.phone || '').replace(/\s/g, '')}`}>
            <span className="horizon-contact-card__icon">
              <FaPhoneAlt />
            </span>
            <h3>{t('contact.phone')}</h3>
            <p>{contact.phone || t('contact.defaultPhone')}</p>
            <span className="horizon-contact-card__hint">{t('contact.phoneHours')}</span>
          </a>

          <a className="horizon-contact-card" href={`mailto:${contact.email || ''}`}>
            <span className="horizon-contact-card__icon">
              <FaEnvelope />
            </span>
            <h3>{t('contact.email')}</h3>
            <p>{contact.email || t('contact.defaultEmail')}</p>
            <span className="horizon-contact-card__hint">{t('contact.reply24h')}</span>
          </a>

          <div className="horizon-contact-card">
            <span className="horizon-contact-card__icon">
              <FaClock />
            </span>
            <h3>{t('contact.workingHours')}</h3>
            <p>{contact.hours || t('contact.defaultHours')}</p>
            <span className="horizon-contact-card__hint">{t('contact.closedHolidays')}</span>
          </div>
        </div>
      </section>

      <section className="horizon-contact-form-section">
        <div className="horizon-contact-form-shell">
          <div className="horizon-contact-form__intro">
            <h2>{t('contact.formTitle')}</h2>
            <p>{t('contact.formLead')}</p>
            {socialLinks.length > 0 && (
              <div className="horizon-contact-social">
                <span>{t('contact.followUs')}</span>
                <ul>
                  {socialLinks.map((item) => {
                    const Icon = SOCIAL_ICONS[item.icon];
                    return (
                      <li key={item.name}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={item.name}
                        >
                          {Icon ? <Icon /> : item.name?.[0] ?? '?'}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <form className="horizon-contact-form" onSubmit={handleSubmit} noValidate>
            <div className="horizon-contact-form__row">
              <label className={`horizon-contact-field ${errors.name ? 'has-error' : ''}`}>
                <span>
                  {t('contact.fullName')} <em>*</em>
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder={t('contact.fullNamePlaceholder')}
                  autoComplete="name"
                />
                {errors.name && <small className="horizon-contact-error">{errors.name}</small>}
              </label>

              <label className={`horizon-contact-field ${errors.email ? 'has-error' : ''}`}>
                <span>
                  {t('auth.email')} <em>*</em>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder={t('contact.emailPlaceholder')}
                  autoComplete="email"
                />
                {errors.email && (
                  <small className="horizon-contact-error">{errors.email}</small>
                )}
              </label>
            </div>

            <div className="horizon-contact-form__row">
              <label className={`horizon-contact-field ${errors.phone ? 'has-error' : ''}`}>
                <span>{t('contact.phone')}</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder={t('contact.phonePlaceholder')}
                  autoComplete="tel"
                />
                {errors.phone && (
                  <small className="horizon-contact-error">{errors.phone}</small>
                )}
              </label>

              <label className="horizon-contact-field">
                <span>{t('contact.subject')}</span>
                <select value={form.subject} onChange={update('subject')}>
                  {SUBJECT_KEYS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.key)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className={`horizon-contact-field ${errors.message ? 'has-error' : ''}`}>
              <span>
                {t('contact.message')} <em>*</em>
              </span>
              <textarea
                rows={6}
                value={form.message}
                onChange={update('message')}
                placeholder={t('contact.messagePlaceholder')}
              />
              {errors.message && (
                <small className="horizon-contact-error">{errors.message}</small>
              )}
            </label>

            <label
              className={`horizon-contact-check ${errors.agree ? 'has-error' : ''}`}
            >
              <input type="checkbox" checked={form.agree} onChange={update('agree')} />
              <span>
                {t('contact.agreeText')}
              </span>
            </label>
            {errors.agree && (
              <small className="horizon-contact-error">{errors.agree}</small>
            )}

            <div className="horizon-contact-form__footer">
              {status.type !== 'idle' && (
                <p
                  className={`horizon-contact-status horizon-contact-status--${status.type}`}
                  role="status"
                >
                  {status.text}
                </p>
              )}
              <button type="submit" className="horizon-contact-submit">
                <FaPaperPlane />
                <span>{t('contact.send')}</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;
