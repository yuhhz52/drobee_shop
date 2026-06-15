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

const SUBJECTS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'sales', label: 'Sales / Pre-order' },
  { value: 'support', label: 'After-sales Support' },
  { value: 'warranty', label: 'Warranty / Returns' },
  { value: 'partnership', label: 'Partnership / B2B' },
];

const Contact = () => {
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
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!form.email.trim()) {
      next.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Email format is invalid.';
    }
    if (form.phone && !/^[0-9+()\-\s]{6,20}$/.test(form.phone.trim())) {
      next.phone = 'Phone number is invalid.';
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      next.message = 'Please write at least 10 characters.';
    }
    if (!form.agree) {
      next.agree = 'You must agree before sending.';
    }
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({ type: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }
    setStatus({
      type: 'success',
      text:
        'Thank you! Your message has been sent. The Horizon team will reply within 24 hours.',
    });
    setForm(initialForm);
  };

  return (
    <div className="horizon-contact">
      <section className="horizon-contact-hero">
        <div className="horizon-contact-hero__inner">
          <span className="horizon-contact-eyebrow">Get in touch</span>
          <h1 className="horizon-contact-title">We&apos;d love to hear from you</h1>
          <p className="horizon-contact-lead">
            Questions about a model, an order, or a partnership? Drop us a line and
            the Horizon team will get back to you within one business day.
          </p>
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
            <h3>Showroom</h3>
            <p>{contact.address || 'Innovation Building, District 1, HCMC'}</p>
            <span className="horizon-contact-card__hint">Open in Google Maps</span>
          </a>

          <a className="horizon-contact-card" href={`tel:${(contact.phone || '').replace(/\s/g, '')}`}>
            <span className="horizon-contact-card__icon">
              <FaPhoneAlt />
            </span>
            <h3>Phone</h3>
            <p>{contact.phone || '+84 909 123 456'}</p>
            <span className="horizon-contact-card__hint">Mon - Sat, 8:30 - 21:00</span>
          </a>

          <a className="horizon-contact-card" href={`mailto:${contact.email || ''}`}>
            <span className="horizon-contact-card__icon">
              <FaEnvelope />
            </span>
            <h3>Email</h3>
            <p>{contact.email || 'support@horizonshop.io.vn'}</p>
            <span className="horizon-contact-card__hint">Reply within 24h</span>
          </a>

          <div className="horizon-contact-card">
            <span className="horizon-contact-card__icon">
              <FaClock />
            </span>
            <h3>Working hours</h3>
            <p>{contact.hours || 'Mon - Sat: 8:30 - 21:00'}</p>
            <span className="horizon-contact-card__hint">Closed on public holidays</span>
          </div>
        </div>
      </section>

      <section className="horizon-contact-form-section">
        <div className="horizon-contact-form-shell">
          <div className="horizon-contact-form__intro">
            <h2>Send us a message</h2>
            <p>
              Fill in the form and our team will reach out. We typically reply within
              one business day.
            </p>
            {socialLinks.length > 0 && (
              <div className="horizon-contact-social">
                <span>Follow us</span>
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
                  Full name <em>*</em>
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Nguyen Van A"
                  autoComplete="name"
                />
                {errors.name && <small className="horizon-contact-error">{errors.name}</small>}
              </label>

              <label className={`horizon-contact-field ${errors.email ? 'has-error' : ''}`}>
                <span>
                  Email <em>*</em>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <small className="horizon-contact-error">{errors.email}</small>
                )}
              </label>
            </div>

            <div className="horizon-contact-form__row">
              <label className={`horizon-contact-field ${errors.phone ? 'has-error' : ''}`}>
                <span>Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+84 909 000 000"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <small className="horizon-contact-error">{errors.phone}</small>
                )}
              </label>

              <label className="horizon-contact-field">
                <span>Subject</span>
                <select value={form.subject} onChange={update('subject')}>
                  {SUBJECTS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className={`horizon-contact-field ${errors.message ? 'has-error' : ''}`}>
              <span>
                Your message <em>*</em>
              </span>
              <textarea
                rows={6}
                value={form.message}
                onChange={update('message')}
                placeholder="Tell us which model you are interested in, or what we can help with..."
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
                I agree that Horizon Shop may contact me regarding my request.
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
                <span>Send message</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;
