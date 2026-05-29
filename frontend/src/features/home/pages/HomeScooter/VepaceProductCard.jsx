import React from 'react';
import { Link } from 'react-router-dom';
import { formatPriceEUR } from '@shared/utils/price-format';
import { getPrimaryResourceUrl } from '@shared/utils/product-media';
import './VepaceProductCard.css';

const VepaceProductCard = ({
  name,
  price,
  salePrice,
  thumbnail,
  productResources,
  newArrival,
  slug,
  brand,
}) => {
  const basePrice = Number(price) || 0;
  const sale = Number(salePrice) || 0;
  const hasSale = sale > 0 && sale < basePrice;
  const displayPrice = hasSale ? sale : basePrice;
  const discountEuro = hasSale ? `- ${formatPriceEUR(basePrice - sale)}` : null;
  const imageUrl = getPrimaryResourceUrl(productResources) || thumbnail;

  return (
    <article className="vepace-product-card">
      <Link to={`/product/${slug}`} className="vepace-product-card__media">
        <div className="vepace-product-card__badges">
          {newArrival && (
            <span className="vepace-product-card__badge vepace-product-card__badge--new">
              NEW
            </span>
          )}
          {hasSale && (
            <span className="vepace-product-card__badge vepace-product-card__badge--sale">
              {discountEuro}
            </span>
          )}
        </div>
        {imageUrl && <img src={imageUrl} alt={name} loading="lazy" />}
      </Link>
      <div className="vepace-product-card__body">
        {brand && <p className="vepace-product-card__brand">{brand}</p>}
        <Link to={`/product/${slug}`} className="vepace-product-card__title">
          {name}
        </Link>
        <div className="vepace-product-card__price">
          <span className="vepace-product-card__sale">{formatPriceEUR(displayPrice)}</span>
          {hasSale && (
            <span className="vepace-product-card__regular">
              {formatPriceEUR(basePrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default VepaceProductCard;
