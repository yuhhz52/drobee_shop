import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '@shared/components/BrandLogo/BrandLogo';
import './Footer.css';

const Footer = ({ content }) => {
  if (!content) return null;

  return (
    <footer className="vepace-footer">
      <div className="vepace-footer__inner">
        <div className="vepace-footer__grid">
          <div className="vepace-footer__about">
            <h4>{content.aboutTitle || 'ABOUT VEPACE'}</h4>
            <p className="vepace-footer__lead">{content.aboutLead}</p>
            <p>{content.aboutText}</p>
          </div>
          {content.items?.map((item, idx) => (
            <div key={idx} className="vepace-footer__col">
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
          <div className="vepace-footer__newsletter">
            <h4>NEWSLETTER</h4>
            <p>Join the Vepace Rider Family &amp; Stay Informed</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" aria-label="Email" />
              <button type="submit" className="vepace-footer__subscribe">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="vepace-footer__bottom">
          <p>{content.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
