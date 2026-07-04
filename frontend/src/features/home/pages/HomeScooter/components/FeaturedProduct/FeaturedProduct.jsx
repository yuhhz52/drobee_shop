import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { addItemToCart, addToCart, selectCartError } from '@app/store/slices/cart.jsx';
import { formatPriceVND } from '@shared/utils/price-format';
import { inferBrand } from '@shared/utils/product-brand';
import { getPrimaryResourceUrl, getProductImages } from '@shared/utils/product-media';
import { colorSelector } from '@shared/components/Filters/ColorFilter';
import './FeaturedProduct.css';

const CDN = 'https://horizon.com/cdn/shop/files';

const FeaturedProduct = ({ product }) => {
  const dispatch = useDispatch();
  const cartError = useSelector(selectCartError);
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const images = useMemo(() => {
    const productImages = getProductImages(product);
    const primary = getPrimaryResourceUrl(product?.productResources);
    if (productImages.length > 0) return productImages;
    return primary ? [primary] : [];
  }, [product]);

  const thumbs = images.slice(0, 5);
  const mainImage = thumbs[activeThumb] || `${CDN}/kukirin-g2-electric-scooter-2026-main.jpg?v=1&width=800`;

  const allVariants = product?.productVariants || [];
  const availableColors = useMemo(
    () => _.uniq(allVariants.map((v) => v.color).filter(Boolean)),
    [allVariants]
  );
  const selectedVariant = useMemo(() => {
    if (!allVariants.length) return null;
    if (!selectedColor) return null;
    return allVariants.find((v) => v.color === selectedColor) || null;
  }, [allVariants, selectedColor]);

  const displayPrice = selectedVariant
    ? (selectedVariant.salePrice || selectedVariant.price || product?.salePrice || product?.price || 0)
    : (product?.salePrice || product?.price || 0);

  const inStock = selectedVariant
    ? (selectedVariant.stockQuantity ?? 1) > 0
    : allVariants.length > 0
      ? allVariants.some((v) => (v.stockQuantity ?? 1) > 0)
      : (product?.stockQuantity ?? 1) > 0;

  const requiresColor = availableColors.length > 0;

  const handleAddToCart = useCallback(() => {
    setFeedback({ type: '', message: '' });
    if (requiresColor && !selectedColor) {
      setFeedback({ type: 'error', message: 'Please select a color' });
      return;
    }
    if (selectedVariant && (selectedVariant.stockQuantity ?? 0) <= 0) {
      setFeedback({ type: 'error', message: 'Out of stock' });
      return;
    }

    // When no variant is selected but variants exist, ensure at least one has stock
    if (!selectedVariant && allVariants.length > 0 && !allVariants.some((v) => (v.stockQuantity ?? 1) > 0)) {
      setFeedback({ type: 'error', message: 'Out of stock' });
      return;
    }

    const item = {
      productId: product.id,
      thumbnail: mainImage,
      name: product.name,
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            variantName: selectedVariant.variantName,
            color: selectedVariant.color,
          }
        : { id: 'default', variantName: '', color: '' },
      quantity: qty,
      price: displayPrice,
    };

    // Instant sync update for responsive UI
    dispatch(addToCart(item));
    // Async backend sync
    dispatch(addItemToCart(item));
    setFeedback({ type: 'success', message: 'Added to cart' });
  }, [dispatch, product, selectedVariant, selectedColor, qty, displayPrice, mainImage, requiresColor]);

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
                {formatPriceVND(displayPrice)}
              </span>
              {product?.salePrice && !selectedVariant && (
                <span className="regular">
                  {formatPriceVND(product?.price)}
                </span>
              )}
            </div>

            {requiresColor && (
              <div className="horizon-featured__colors">
                <p className="horizon-featured__variant-label">
                  Color: <strong>{selectedColor || 'Select an option'}</strong>
                </p>
                <div className="horizon-featured__variants">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={selectedColor === color ? 'is-active' : ''}
                      style={{ background: colorSelector[color] || color }}
                      title={color}
                      aria-label={color}
                      onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                    />
                  ))}
                </div>
              </div>
            )}

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

            <button
              type="button"
              className="horizon-btn horizon-btn--black horizon-btn--full"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              {inStock ? 'Add to cart' : 'Sold out'}
            </button>
            <Link
              to={product ? `/product/${product.slug}` : '/products'}
              className="horizon-featured__view-details"
            >
              View full details →
            </Link>

            {feedback.message && (
              <p
                className={`horizon-featured__feedback ${
                  feedback.type === 'error' ? 'is-error' : 'is-success'
                }`}
                role="status"
              >
                {feedback.message}
              </p>
            )}
            {!feedback.message && cartError && (
              <p className="horizon-featured__feedback is-error" role="status">
                {cartError}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;
