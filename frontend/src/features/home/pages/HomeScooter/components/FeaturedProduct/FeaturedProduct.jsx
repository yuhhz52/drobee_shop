import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { formatPriceVND } from '@shared/utils/price-format';
import { inferBrand } from '@shared/utils/product-brand';
import { getPrimaryResourceUrl, getProductImages } from '@shared/utils/product-media';
import './FeaturedProduct.css';

const CDN = 'https://horizon.com/cdn/shop/files';

const FeaturedProduct = ({ product }) => {
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);

  const images = useMemo(() => {
    const productImages = getProductImages(product);
    const primary = getPrimaryResourceUrl(product?.productResources);
    if (productImages.length > 0) return productImages;
    return primary ? [primary] : [];
  }, [product]);

  const thumbs = images.slice(0, 5);
  const mainImage = thumbs[activeThumb] || `${CDN}/kukirin-g2-electric-scooter-2026-main.jpg?v=1&width=800`;

  return (
    <section className="horizon-section horizon-section--featured">
      <div className="horizon-container">
        <div className="horizon-section-head">
          <h2>Featured Electric Scooter</h2>
          <Link
            to={product ? `/product/${product.slug}` : '/products'}
            className="horizon-link-red"
          >
            View details
          </Link>
        </div>
        <div className="horizon-featured">
          <div className="horizon-featured__gallery">
            <div className="horizon-featured__thumbs">
              {thumbs.map((src, index) => (
                <button
                  key={`thumb-${index}`}
                  type="button"
                  className={activeThumb === index ? 'is-active' : ''}
                  onClick={() => setActiveThumb(index)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
            <div className="horizon-featured__main">
              <img
                src={mainImage}
                alt={product?.name || 'Featured scooter'}
              />
              <p className="horizon-featured__zoom-hint">
                Roll over image to zoom in
              </p>
            </div>
          </div>
          <div className="horizon-featured__info">
            <h3>{product?.name || 'Featured Electric Scooter'}</h3>
            <div className="horizon-featured__badges">
              {product?.newArrival && (
                <span className="badge badge--blue">NEW</span>
              )}
              {product?.featured && (
                <span className="badge badge--green">Featured</span>
              )}
              {product?.salePrice && (
                <span className="badge badge--red">Sale</span>
              )}
            </div>
            <p className="horizon-featured__brand">
              {product?.brand || inferBrand(product?.name) || 'HORIZON'}
            </p>
            {product?.rating && (
              <div className="horizon-featured__rating">
                {'★'.repeat(Math.round(product.rating))}
                {'☆'.repeat(5 - Math.round(product.rating))}
                {' '}
                {product.rating} ({product.totalSold || 0} sold)
              </div>
            )}
            {product?.shortDescription && (
              <p className="horizon-featured__description">
                {product.shortDescription}
              </p>
            )}
            <div className="horizon-featured__price">
              <span className="label">Price:</span>
              <span className="sale">
                {formatPriceVND(product?.salePrice || product?.price || 0)}
              </span>
              {product?.salePrice && (
                <span className="regular">
                  {formatPriceVND(product?.price)}
                </span>
              )}
            </div>
            <div className="horizon-featured__qty">
              <span>Quantity:</span>
              <div className="horizon-qty">
                <button
                  type="button"
                  aria-label="Decrease"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <FiMinus />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  aria-label="Increase"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
            <Link
              to={product ? `/product/${product.slug}` : '/products'}
              className="horizon-btn horizon-btn--black horizon-btn--full"
            >
              Add to cart
            </Link>
            <button type="button" className="horizon-btn horizon-btn--paypal horizon-btn--full">
              Pay with PayPal
            </button>
            <button type="button" className="horizon-featured__more-pay">
              More payment options
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;
