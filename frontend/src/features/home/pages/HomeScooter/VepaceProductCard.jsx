import React from 'react';
import { Link } from 'react-router-dom';
import { formatPriceVND } from '@shared/utils/price-format';
import { getPrimaryResourceUrl } from '@shared/utils/product-media';
import './VepaceProductCard.css';

const SpecBadge = ({ value, unit, label }) => {
  if (value == null) return null;
  return (
    <span className="vepace-product-card__spec-badge" title={label}>
      <span className="vepace-product-card__spec-badge-value">{value}</span>
      <span className="vepace-product-card__spec-badge-unit">{unit}</span>
    </span>
  );
};

const VepaceProductCard = ({
  name,
  price,
  salePrice,
  thumbnail,
  productResources,
  newArrival,
  slug,
  brand,
  maxSpeedKmh,
  rangeKm,
  motorPowerW,
  weightKg,
}) => {
  const basePrice = Number(price) || 0;
  const sale = Number(salePrice) || 0;
  const hasSale = sale > 0 && sale < basePrice;
  const displayPrice = hasSale ? sale : basePrice;
  const discountAmount = hasSale ? `- ${formatPriceVND(basePrice - sale)}` : null;
  const imageUrl = getPrimaryResourceUrl(productResources) || thumbnail;

  const hasSpecs = maxSpeedKmh != null || rangeKm != null || motorPowerW != null || weightKg != null;

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
              {discountAmount}
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
        {hasSpecs && (
          <div className="vepace-product-card__specs">
            <SpecBadge value={maxSpeedKmh} unit="km/h" label="Tốc độ tối đa" />
            <SpecBadge value={rangeKm} unit="km" label="Quãng đường" />
            <SpecBadge value={motorPowerW} unit="W" label="Công suất" />
            <SpecBadge value={weightKg ? Math.round(Number(weightKg)) : null} unit="kg" label="Trọng lượng" />
          </div>
        )}
        <div className="vepace-product-card__price">
          <span className="vepace-product-card__sale">{formatPriceVND(displayPrice)}</span>
          {hasSale && (
            <span className="vepace-product-card__regular">
              {formatPriceVND(basePrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default VepaceProductCard;
