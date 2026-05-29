import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiMinus, FiPlus } from 'react-icons/fi';
import _ from 'lodash';
import { getAllProducts } from '@services/product.service';
import { addItemToCartAction } from '@app/store/actions/cartAction';
import { formatPriceEUR } from '@shared/utils/price-format';
import { inferBrandFromProduct } from '@shared/utils/product-brand';
import { getPrimaryResourceUrl, getProductImages } from '@shared/utils/product-media';
import VepaceProductCard from '@features/home/pages/HomeScooter/VepaceProductCard';
import './ProductDetails.css';

const ProductModal = ({ title, open, onClose, children }) => {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        className="vepace-pdp__modal-backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="vepace-pdp__modal" role="dialog" aria-modal="true">
        <div className="vepace-pdp__modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="vepace-pdp__modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="vepace-pdp__modal-body">{children}</div>
      </div>
    </>
  );
};

const ProductDetails = () => {
  const { product } = useLoaderData();
  const dispatch = useDispatch();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedVariantName, setSelectedVariantName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  const images = useMemo(() => getProductImages(product), [product]);

  const primaryImage = useMemo(
    () => getPrimaryResourceUrl(product?.productResources),
    [product]
  );

  const basePrice = Number(product?.price) || 0;
  const salePrice = Number(product?.salePrice) || 0;
  const hasSale = salePrice > 0 && salePrice < basePrice;
  const displayPrice = hasSale ? salePrice : basePrice;
  const discountPercent = hasSale && basePrice > 0
    ? Math.round(((basePrice - salePrice) / basePrice) * 100)
    : 0;
  const discountAmount = hasSale ? formatPriceEUR(basePrice - salePrice) : null;

  const brand = inferBrandFromProduct(product);

  const colors = useMemo(
    () => _.uniq((product?.variants || []).map((v) => v.color).filter(Boolean)),
    [product]
  );

  const variantNames = useMemo(() => {
    const pool = selectedColor
      ? (product?.variants || []).filter((v) => v.color === selectedColor)
      : product?.variants || [];
    return _.uniq(pool.map((v) => v.variantName).filter(Boolean));
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants.find((v) => {
      const colorOk = !colors.length || v.color === selectedColor;
      const variantOk = !variantNames.length || v.variantName === selectedVariantName;
      return colorOk && variantOk;
    });
  }, [product, colors, variantNames, selectedColor, selectedVariantName]);

  const inStock = selectedVariant
    ? (selectedVariant.stockQuantity ?? 1) > 0
    : (product?.variants || []).some((v) => (v.stockQuantity ?? 1) > 0);

  const variantLabel = variantNames.length > 0 ? 'Version' : colors.length > 0 ? 'Option' : '';

  useEffect(() => {
    if (!product?.id) return;
    getAllProducts({
      categoryId: product.categoryId,
      typeIds: product.categoryTypeId ? [product.categoryTypeId] : [],
      size: 8,
    })
      .then((res) => {
        setSimilarProducts((res.products || []).filter((p) => p.id !== product.id).slice(0, 6));
      })
      .catch(() => setSimilarProducts([]));
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedVariantName('');
    setSelectedColor('');
    setQuantity(1);
    setError('');
  }, [product?.id]);

  useEffect(() => {
    if (selectedVariantName || selectedColor) setError('');
  }, [selectedVariantName, selectedColor]);

  const addItemToCart = useCallback(() => {
    if (variantNames.length && !selectedVariantName) {
      setError('Please select a version');
      return;
    }
    if (colors.length && !selectedColor) {
      setError('Please select an option');
      return;
    }
    if (!selectedVariant && product?.variants?.length) {
      setError('Please select product options');
      return;
    }
    if (selectedVariant && (selectedVariant.stockQuantity ?? 0) <= 0) {
      setError('Out of stock');
      return;
    }

    dispatch(
      addItemToCartAction({
        productId: product.id,
        thumbnail: activeImage || primaryImage,
        name: product.name,
        variant: selectedVariant || { id: 'default', variantName: '', color: '' },
        quantity,
        price: displayPrice,
      })
    );
    setError('');
  }, [
    dispatch,
    product,
    selectedVariant,
    selectedVariantName,
    selectedColor,
    variantNames,
    colors,
    quantity,
    displayPrice,
  ]);

  if (!product) {
    return <div className="vepace-pdp__empty">Product not found.</div>;
  }

  const activeImage = images[activeImageIndex] || primaryImage;

  return (
    <div className="vepace-pdp">
      <div className="vepace-pdp__breadcrumb-wrap">
        <div className="vepace-pdp__container">
          <nav className="vepace-pdp__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Electric Scooters</Link>
            <span>/</span>
            <span className="is-current">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="vepace-pdp__main vepace-pdp__container">
        <div className="vepace-pdp__gallery">
          {images.length > 1 && (
            <div className="vepace-pdp__thumbs">
              {images.map((url, index) => (
                <button
                  key={url + index}
                  type="button"
                  className={activeImageIndex === index ? 'is-active' : ''}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
          <div className="vepace-pdp__main-image">
            {activeImage && <img src={activeImage} alt={product.name} />}
            <p className="vepace-pdp__zoom-hint">Roll over image to zoom in</p>
          </div>
        </div>

        <div className="vepace-pdp__info">
          <h1>{product.name}</h1>

          <div className="vepace-pdp__badges">
            {product.newArrival && <span className="badge badge--blue">NEW</span>}
            {product.featured && (
              <span className="badge badge--blue">Featured</span>
            )}
            {hasSale && (
              <span className="badge badge--red">
                {discountAmount ? `- ${discountAmount}` : `-${discountPercent}%`}
              </span>
            )}
            {hasSale && (
              <span className="badge badge--green">DGT</span>
            )}
          </div>

          {brand && <p className="vepace-pdp__brand">{brand}</p>}

          <div className="vepace-pdp__rating">★★★★★ 24 reviews</div>

          {variantNames.length > 0 && (
            <div className="vepace-pdp__variant">
              <p className="vepace-pdp__variant-label">
                {variantLabel}: {selectedVariantName || variantNames[0]}
              </p>
              <div className="vepace-pdp__variant-btns">
                {variantNames.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    className={selectedVariantName === variant ? 'is-active' : ''}
                    onClick={() =>
                      setSelectedVariantName(selectedVariantName === variant ? '' : variant)
                    }
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="vepace-pdp__variant">
              <p className="vepace-pdp__variant-label">
                Color{selectedColor ? `: ${selectedColor}` : ''}
              </p>
              <div className="vepace-pdp__colors">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={selectedColor === color ? 'is-active' : ''}
                    style={{ background: colorSelector[color] || color }}
                    title={color}
                    aria-label={color}
                    onClick={() => {
                      setSelectedColor(selectedColor === color ? '' : color);
                      setSelectedVariantName('');
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="vepace-pdp__price">
            <span className="label">Price:</span>
            <span className="sale">{formatPriceEUR(displayPrice)}</span>
            {hasSale && (
              <span className="regular">{formatPriceEUR(basePrice)}</span>
            )}
          </div>

          {error && <p className="vepace-pdp__error">{error}</p>}

          <div className="vepace-pdp__qty-row">
            <span>Quantity:</span>
            <div className="vepace-pdp__qty">
              <button
                type="button"
                aria-label="Decrease"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <FiMinus size={14} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <FiPlus size={14} />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="vepace-pdp__atc"
            onClick={addItemToCart}
            disabled={!inStock}
          >
            {inStock ? 'Add to cart' : 'Sold out'}
          </button>

          <button type="button" className="vepace-pdp__paypal">
            Pay with PayPal
          </button>

          <button
            type="button"
            className="vepace-pdp__more-pay"
            onClick={() => setDeliveryOpen(true)}
          >
            More payment options
          </button>

          <div className="vepace-pdp__meta">
            <p>
              Availability:{' '}
              <span className={inStock ? 'in-stock' : 'out-stock'}>
                {inStock ? 'In stock' : 'Out of stock'}
              </span>
            </p>
            {product.categoryTypeName && (
              <p>
                Type: <span>{product.categoryTypeName}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            className="vepace-pdp__shipping-link"
            onClick={() => setDeliveryOpen(true)}
          >
            Delivery &amp; Return
          </button>
        </div>
      </div>

      {product.description && (
        <section className="vepace-pdp__description vepace-pdp__container">
          <h2>Description</h2>
          <div className="vepace-pdp__description-body">{product.description}</div>
        </section>
      )}

      <section className="vepace-pdp__trust">
        <div className="vepace-pdp__container vepace-pdp__trust-grid">
          <div>
            <strong>EU shipping</strong>
            <p>All Europe 3 - 7 working days</p>
          </div>
          <div>
            <strong>Free helmet</strong>
            <p>VEPACE protects his Riders</p>
          </div>
          <div>
            <strong>7/7 Support</strong>
            <p>Any Question contact us !</p>
          </div>
          <div>
            <strong>Secure payments</strong>
            <p>100% secure checkout</p>
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="vepace-pdp__related">
          <div className="vepace-pdp__container">
            <div className="vepace-pdp__related-head">
              <h2>You may also like</h2>
              <Link to="/products" className="vepace-pdp__view-all">
                View all
              </Link>
            </div>
            <div className="vepace-pdp__related-grid">
              {similarProducts.map((item) => (
                <VepaceProductCard
                  key={item.id}
                  {...item}
                  brand={inferBrandFromProduct(item)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <ProductModal
        title="Delivery & Return"
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
      >
        <h4>Delivery</h4>
        <ul>
          <li>Delivery to all EU countries, 3-7 working days.</li>
          <li>Tracking number provided for every order.</li>
        </ul>
        <h4>Returns</h4>
        <ul>
          <li>Returns accepted within 14 days in original condition.</li>
          <li>Contact support for RMA before sending items back.</li>
        </ul>
      </ProductModal>
    </div>
  );
};

export default ProductDetails;
