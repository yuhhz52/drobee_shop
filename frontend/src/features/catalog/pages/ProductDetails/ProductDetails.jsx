import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMinus, FiPlus } from 'react-icons/fi';
import _ from 'lodash';
import { getAllProducts } from '@services/product.service';
import { addItemToCart, addToCart, selectCartError, selectCartLoading } from '@app/store/slices/cart.jsx';
import { formatPriceVND } from '@shared/utils/price-format';
import { inferBrandFromProduct } from '@shared/utils/product-brand';
import { getPrimaryResourceUrl, getProductImages } from '@shared/utils/product-media';
import { writeDirectCheckoutItem } from '@shared/utils/direct-checkout';
import { colorSelector } from '@shared/components/Filters/ColorFilter';
import { ProductCard } from '@features/home/pages/HomeScooter/components';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './ProductDetails.css';

const SPEC_TAB_KEYS = ['overview', 'battery', 'chassis', 'dimensions', 'extra'];

const SPEC_GROUP_KEYS = {
  overview: ['maxSpeedKmh', 'rangeKm', 'motorPowerW', 'peakPowerW', 'weightKg', 'maxLoadKg', 'maxInclinePercent'],
  battery: ['batteryCapacityAh', 'batteryVoltageV', 'batteryType', 'chargingTimeHours', 'removableBattery'],
  chassis: ['frameMaterial', 'wheelSizeInch', 'tireType', 'brakeFront', 'brakeRear', 'suspensionFront', 'suspensionRear'],
  dimensions: ['lengthCm', 'widthCm', 'heightCm', 'foldedLengthCm', 'foldedWidthCm', 'foldedHeightCm'],
  extra: ['maxSpeedUnlockedKmh', 'lights', 'displayType', 'connectivity', 'waterResistanceRating', 'warrantyMonths', 'certifications'],
};

const FIELD_UNITS = {
  maxSpeedKmh: 'km/h',
  rangeKm: 'km',
  motorPowerW: 'W',
  peakPowerW: 'W',
  weightKg: 'kg',
  maxLoadKg: 'kg',
  maxInclinePercent: '%',
  batteryCapacityAh: 'Ah',
  batteryVoltageV: 'V',
  batteryType: '',
  chargingTimeHours: 'h',
  removableBattery: '',
  frameMaterial: '',
  wheelSizeInch: 'inch',
  tireType: '',
  brakeFront: '',
  brakeRear: '',
  suspensionFront: '',
  suspensionRear: '',
  lengthCm: 'cm',
  widthCm: 'cm',
  heightCm: 'cm',
  foldedLengthCm: 'cm',
  foldedWidthCm: 'cm',
  foldedHeightCm: 'cm',
  maxSpeedUnlockedKmh: 'km/h',
  lights: '',
  displayType: '',
  connectivity: '',
  waterResistanceRating: '',
  warrantyMonths: 'months',
  certifications: '',
};

const fmt = (val, unit) => {
  if (val == null) return null;
  const n = Number(val);
  if (isNaN(n)) return null;
  if (unit === 'Ah' || unit === 'V') return `${n}`;
  if (unit === 'h') return `${n.toFixed(1)}h`;
  if (unit === 'inch') return `${n.toFixed(1)}"`;
  if (['km/h', 'km', 'W', 'kg', '%', 'months'].includes(unit)) return `${n}`;
  if (unit === 'cm') return `${n}`;
  return val;
};

const boolLabel = (v, t) => {
  if (v === true) return t('product.boolYes');
  if (v === false) return t('product.boolNo');
  return null;
};

const SpecsSection = ({ product }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = SPEC_TAB_KEYS.filter((tabKey) =>
    SPEC_GROUP_KEYS[tabKey].some((fieldKey) => product[fieldKey] != null)
  );
  const hasSpecs = tabs.length > 0;

  if (!hasSpecs) return null;

  const fields = SPEC_GROUP_KEYS[activeTab] || [];

  return (
    <section className="horizon-pdp__specs horizon-pdp__container">
      <h2>{t('product.specsTitle')}</h2>
      <div className="horizon-pdp__specs-tabs">
        {tabs.map((tabKey) => {
          const hasData = SPEC_GROUP_KEYS[tabKey].some(
            (fieldKey) => product[fieldKey] != null
          );
          if (!hasData) return null;
          return (
            <button
              key={tabKey}
              type="button"
              className={`horizon-pdp__specs-tab ${activeTab === tabKey ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tabKey)}
            >
              {t(`product.tabs.${tabKey}`)}
            </button>
          );
        })}
      </div>
      <div className="horizon-pdp__specs-table">
        <div className="horizon-pdp__specs-table-inner">
          {fields.map((fieldKey) => {
            const unit = FIELD_UNITS[fieldKey] || '';
            let raw = product[fieldKey];
            if (unit === '' && fieldKey === 'removableBattery') {
              raw = boolLabel(raw, t);
            }
            const val = fmt(raw, unit);
            if (val == null) return null;
            return (
              <div key={fieldKey} className="horizon-pdp__specs-row">
                <span className="horizon-pdp__specs-label">{t(`product.specLabels.${fieldKey}`)}</span>
                <span className="horizon-pdp__specs-value">
                  {val}{unit && val != null ? ` ${unit}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ProductModal = ({ title, open, onClose, children }) => {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        className="horizon-pdp__modal-backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="horizon-pdp__modal" role="dialog" aria-modal="true">
        <div className="horizon-pdp__modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="horizon-pdp__modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="horizon-pdp__modal-body">{children}</div>
      </div>
    </>
  );
};

const ProductDetails = () => {
  const { product } = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Cart state
  const cartError = useSelector(selectCartError);
  const cartLoading = useSelector(selectCartLoading);

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
  const discountAmount = hasSale ? formatPriceVND(basePrice - salePrice) : null;

  const brand = inferBrandFromProduct(product);

  // All variants
  const allVariants = product?.variants || [];

  // All unique versions (variantNames)
  const allVersions = useMemo(() => {
    return _.uniq(allVariants.map((v) => v.variantName).filter(Boolean));
  }, [allVariants]);

  const hasVersions = allVersions.length > 0;

  // Available colors based on selected version (only show colors that belong to selected version)
  const availableColors = useMemo(() => {
    if (!selectedVariantName) {
      // If no version selected, show all colors
      return _.uniq(allVariants.map((v) => v.color).filter(Boolean));
    }
    // Only show colors that belong to the selected version
    return _.uniq(
      allVariants
        .filter((v) => v.variantName === selectedVariantName)
        .map((v) => v.color)
        .filter(Boolean)
    );
  }, [allVariants, selectedVariantName]);

  // Available versions based on selected color (only show versions that have this color)
  const availableVersions = useMemo(() => {
    if (!selectedColor) {
      return allVersions;
    }
    return _.uniq(
      allVariants
        .filter((v) => v.color === selectedColor)
        .map((v) => v.variantName)
        .filter(Boolean)
    );
  }, [allVariants, selectedColor, allVersions]);

  // Find matching variant based on selections
  const selectedVariant = useMemo(() => {
    if (!allVariants.length) return null;
    if (!selectedColor && !selectedVariantName) return null;
    return allVariants.find((v) => {
      if (selectedColor && v.color !== selectedColor) return false;
      if (selectedVariantName && v.variantName !== selectedVariantName) return false;
      return true;
    }) || null;
  }, [allVariants, selectedColor, selectedVariantName]);

  // Auto-select first version and its first color on load
  useEffect(() => {
    if (allVariants.length > 0 && !selectedVariantName && !selectedColor) {
      if (hasVersions) {
        const firstVersion = allVersions[0];
        setSelectedVariantName(firstVersion);
        // Auto-select first color of this version
        const firstColor = allVariants.find((v) => v.variantName === firstVersion)?.color;
        if (firstColor) {
          setSelectedColor(firstColor);
        }
      }
    }
  }, [allVariants.length]);

  const inStock = selectedVariant
    ? (selectedVariant.stockQuantity ?? 1) > 0
    : allVariants.some((v) => (v.stockQuantity ?? 1) > 0);

  const variantLabel = t('product.version');

  const activeImage = images[activeImageIndex] || primaryImage;

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

  // Reset selections when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedVariantName('');
    setSelectedColor('');
    setQuantity(1);
    setError('');
  }, [product?.id]);

  // Sync cart errors from Redux to local state
  useEffect(() => {
    if (cartError) {
      setError(cartError);
    }
  }, [cartError]);

  // Auto-select defaults when variants load
  useEffect(() => {
    if (allVariants.length > 0 && !selectedVariantName && !selectedColor) {
      if (hasVersions) {
        const firstVersion = allVersions[0];
        setSelectedVariantName(firstVersion);
        const firstColor = allVariants.find((v) => v.variantName === firstVersion)?.color;
        if (firstColor) {
          setSelectedColor(firstColor);
        }
      }
    }
  }, [allVariants.length, hasVersions, allVersions]);

  const handleAddToCart = useCallback(() => {
    // Require version selection if product has versions
    if (hasVersions && !selectedVariantName) {
      setError(t('product.errors.selectVersion'));
      return;
    }
    // Require color selection if available colors exist
    if (availableColors.length > 0 && !selectedColor) {
      setError(t('product.errors.selectOption'));
      return;
    }
    if (!selectedVariant && allVariants.length) {
      setError(t('product.errors.selectProductOptions'));
      return;
    }
    if (selectedVariant && (selectedVariant.stockQuantity ?? 0) <= 0) {
      setError(t('product.outOfStock'));
      return;
    }

    const item = {
      productId: product.id,
      thumbnail: activeImage || primaryImage,
      name: product.name,
      variant: selectedVariant
        ? { id: selectedVariant.id, variantName: selectedVariant.variantName, color: selectedVariant.color }
        : { id: 'default', variantName: '', color: '' },
      quantity,
      price: displayPrice,
    };
    // Instant sync update for responsive UI
    dispatch(addToCart(item));
    // Async backend sync
    dispatch(addItemToCart(item));
    setError('');
  }, [
    dispatch,
    product,
    selectedVariant,
    selectedVariantName,
    selectedColor,
    hasVersions,
    availableColors,
    allVariants,
    quantity,
    displayPrice,
    activeImage,
    primaryImage,
  ]);

  const handleBuyNow = useCallback(() => {
    // Validate selections
    if (hasVersions && !selectedVariantName) {
      setError(t('product.errors.selectVersion'));
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      setError(t('product.errors.selectOption'));
      return;
    }
    if (!selectedVariant && allVariants.length) {
      setError(t('product.errors.selectProductOptions'));
      return;
    }
    if (selectedVariant && (selectedVariant.stockQuantity ?? 0) <= 0) {
      setError(t('product.outOfStock'));
      return;
    }

    const item = {
      productId: product.id,
      thumbnail: activeImage || primaryImage,
      name: product.name,
      variant: selectedVariant
        ? { id: selectedVariant.id, variantName: selectedVariant.variantName, color: selectedVariant.color }
        : { id: 'default', variantName: '', color: '' },
      quantity,
      price: displayPrice,
    };
    setError('');

    // Save the Buy Now item to sessionStorage via the shared helper so the
    // Buy Now checkout page can read it consistently. The cart is NEVER
    // touched by Buy Now — it remains exactly as the user left it.
    writeDirectCheckoutItem(item);

    // Navigate to the dedicated Buy Now checkout page — never to the
    // shared /checkout route.
    navigate('/buy-now/checkout');
  }, [
    dispatch,
    navigate,
    product,
    selectedVariant,
    selectedVariantName,
    selectedColor,
    hasVersions,
    availableColors,
    allVariants,
    quantity,
    displayPrice,
    activeImage,
    primaryImage,
  ]);

  if (!product) {
    return <div className="horizon-pdp__empty">{t('product.notFound')}</div>;
  }

  return (
    <div className="horizon-pdp">
      <div className="horizon-pdp__breadcrumb-wrap">
        <div className="horizon-pdp__container">
          <nav className="horizon-pdp__breadcrumb" aria-label={t('common.breadcrumb')}>
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <Link to="/products">{t('product.collectionBreadcrumb')}</Link>
            <span>/</span>
            <span className="is-current">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="horizon-pdp__main horizon-pdp__container">
        <div className="horizon-pdp__gallery">
          {images.length > 1 && (
            <div className="horizon-pdp__thumbs">
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
          <div className="horizon-pdp__main-image">
            {activeImage && <img src={activeImage} alt={product.name} />}
            <p className="horizon-pdp__zoom-hint">{t('product.zoomHint')}</p>
          </div>
        </div>

        <div className="horizon-pdp__info">
          <h1>{product.name}</h1>

          <div className="horizon-pdp__badges">
            {product.newArrival && <span className="badge badge--blue">NEW</span>}
            {product.featured && (
              <span className="badge badge--blue">{t('product.featuredBadge')}</span>
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

          {brand && <p className="horizon-pdp__brand">{brand}</p>}

          <div className="horizon-pdp__rating">{t('product.reviewsLabel', { count: 24 })}</div>

          {hasVersions && (
            <div className="horizon-pdp__variant">
              <p className="horizon-pdp__variant-label">
                {variantLabel}
              </p>
              <div className="horizon-pdp__variant-btns">
                {allVersions.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    className={selectedVariantName === variant ? 'is-active' : ''}
                    onClick={() => {
                      setSelectedVariantName(selectedVariantName === variant ? '' : variant);
                      // Auto-select first color for this version
                      const colorsForVariant = _.uniq(
                        allVariants
                          .filter((v) => v.variantName === variant)
                          .map((v) => v.color)
                          .filter(Boolean)
                      );
                      if (colorsForVariant.length > 0) {
                        setSelectedColor(colorsForVariant[0]);
                      }
                    }}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableColors.length > 0 && (
            <div className="horizon-pdp__variant">
              <p className="horizon-pdp__variant-label">
                {t('product.color')}{selectedColor ? `: ${selectedColor}` : ''}
              </p>
              <div className="horizon-pdp__colors">
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

          <div className="horizon-pdp__price">
            <span className="label">{t('product.price')}:</span>
            <span className="sale">{formatPriceVND(displayPrice)}</span>
            {hasSale && (
              <span className="regular">{formatPriceVND(basePrice)}</span>
            )}
          </div>

          {error && <p className="horizon-pdp__error">{error}</p>}

          <div className="horizon-pdp__qty-row">
            <span>{t('product.quantity')}</span>
            <div className="horizon-pdp__qty">
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
            className="horizon-pdp__atc"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {inStock ? t('product.addToCart') : t('product.soldOut')}
          </button>

          <button
            type="button"
            className="horizon-pdp__buynow"
            onClick={handleBuyNow}
            disabled={!inStock}
          >
            {t('product.buyNow')}
          </button>

          <button
            type="button"
            className="horizon-pdp__more-pay"
            onClick={() => setDeliveryOpen(true)}
          >
            {t('product.morePaymentOptions')}
          </button>

          <div className="horizon-pdp__meta">
            <p>
              {t('product.availability')}:{' '}
              <span className={inStock ? 'in-stock' : 'out-stock'}>
                {inStock ? t('product.inStock') : t('product.outOfStock')}
              </span>
            </p>
            {product.categoryTypeName && (
              <p>
                {t('product.type')}: <span>{product.categoryTypeName}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            className="horizon-pdp__shipping-link"
            onClick={() => setDeliveryOpen(true)}
          >
            {t('product.deliveryReturn')}
          </button>
        </div>
      </div>

      {product.description && (
        <section className="horizon-pdp__description horizon-pdp__container">
          <h2>{t('product.description')}</h2>
          <div className="horizon-pdp__description-body">{product.description}</div>
        </section>
      )}

      <SpecsSection product={product} />

      <section className="horizon-pdp__trust">
        <div className="horizon-pdp__container horizon-pdp__trust-grid">
          <div>
            <strong>{t('product.trust.shippingTitle')}</strong>
            <p>{t('product.trust.shippingDesc')}</p>
          </div>
          <div>
            <strong>{t('product.trust.helmetTitle')}</strong>
            <p>{t('product.trust.helmetDesc')}</p>
          </div>
          <div>
            <strong>{t('product.trust.supportTitle')}</strong>
            <p>{t('product.trust.supportDesc')}</p>
          </div>
          <div>
            <strong>{t('product.trust.paymentsTitle')}</strong>
            <p>{t('product.trust.paymentsDesc')}</p>
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="horizon-pdp__related">
          <div className="horizon-pdp__container">
            <div className="horizon-pdp__related-head">
              <h2>{t('product.youMayAlsoLike')}</h2>
              <Link to="/products" className="horizon-pdp__view-all">
                {t('common.viewAll')}
              </Link>
            </div>
            <div className="horizon-pdp__related-grid">
              {similarProducts.map((item) => (
                <ProductCard
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
        title={t('product.deliveryReturn')}
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
      >
        <h4>{t('product.deliveryTitle')}</h4>
        <ul>
          <li>{t('product.deliveryItem1')}</li>
          <li>{t('product.deliveryItem2')}</li>
        </ul>
        <h4>{t('product.returnTitle')}</h4>
        <ul>
          <li>{t('product.returnItem1')}</li>
          <li>{t('product.returnItem2')}</li>
        </ul>
      </ProductModal>
    </div>
  );
};

export default ProductDetails;
