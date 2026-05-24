import React from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../BrandLogo/BrandLogo';
import vnpayLogo from '../../assets/images/vnpay.png';
import momoLogo from '../../assets/images/momo.png';
import stripeLogo from '../../assets/images/stripe.png';
import './Footer.css';

const Footer = ({ content }) => {
  if (!content || !content.items) return null;
  return (
    <footer className="kalles-footer">
      <div className="kalles-footer__inner">
        <div className="kalles-footer__grid">
          <div className="kalles-footer__brand">
            <BrandLogo linkClassName="kalles-footer__logo" />
            <p>
              Cửa hàng thời trang trực tuyến mang đến xu hướng mới nhất và phong cách hiện đại cho mọi giới tính.
            </p>
          </div>
          {content.items.map((item, idx) => (
            <div key={idx} className="kalles-footer__col">
              <h4>{item.title}</h4>
              <ul>
                {item.list?.map((listItem, lidx) => (
                  <li key={lidx}>
                    <Link to={listItem.path || '#'}>{listItem.label}</Link>
                  </li>
                ))}
                {item.description && <li>{item.description}</li>}
              </ul>
            </div>
          ))}
        </div>
        <div className="kalles-footer__bottom">
          <p>{content?.copyright}</p>
          <div className="kalles-footer__payments">
            <img src={vnpayLogo} alt="VNPay" />
            <img src={momoLogo} alt="MoMo" />
            <img src={stripeLogo} alt="Stripe" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
