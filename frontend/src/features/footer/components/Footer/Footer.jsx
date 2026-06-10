import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '@shared/components/BrandLogo/BrandLogo';
import './Footer.css';

const Footer = ({ content }) => {
  if (!content) return null;

  return (
    <footer className="horizon-footer">
      <div className="horizon-footer__inner">
        <div className="horizon-footer__grid">
          <div className="horizon-footer__about">
            <h4>{content.aboutTitle || 'ABOUT HORIZON'}</h4>
            <p className="horizon-footer__lead">{content.aboutLead}</p>
            <p>{content.aboutText}</p>
          </div>
          {content.items?.map((item, idx) => (
            <div key={idx} className="horizon-footer__col">
              <h4>{item.title}</h4>
              <ul>
                {item.list?.map((listItem, lidx) => (
                  <li key={lidx}>
                    <Link to={listItem.path || '#'}>{listItem.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="horizon-footer__newsletter">
            <h4>NEWSLETTER</h4>
            <p>Join the Horizon Rider Family &amp; Stay Informed</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" aria-label="Email" />
              <button type="submit" className="horizon-footer__subscribe">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="horizon-footer__bottom">
          <p>{content.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
