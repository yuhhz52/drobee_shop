import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMinus, FiPlus } from 'react-icons/fi';
import _ from 'lodash';
import { getAllProducts } from '@services/product.service';
import { addItemToCart, addToCart, selectCartError, selectCartLoading } from '@app/store/slices/cart.jsx';
import { formatPriceVND } from '@shared/utils/price-format';
import { inferBrandFromProduct } from '@shared/utils/product-brand';
import { getPrimaryResourceUrl, getProductImages } from '@shared/utils/product-media';
import { colorSelector } from '@shared/components/Filters/ColorFilter';
import HorizonProductCard from '@features/home/pages/HomeScooter/HorizonProductCard';
import './ProductDetails.css';

const SPEC_TABS = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'battery', label: 'Pin & Sạc' },
  { key: 'chassis', label: 'Khung & Phanh' },
  { key: 'dimensions', label: 'Kích thước' },
  { key: 'extra', label: 'Khác' },
];

const SPEC_GROUPS = {
  overview: [
    { key: 'maxSpeedKmh', label: 'Tốc độ tối đa', unit: 'km/h' },
    { key: 'rangeKm', label: 'Quãng đường', unit: 'km' },
    { key: 'motorPowerW', label: 'Công suất', unit: 'W' },
    { key: 'peakPowerW', label: 'Công suất đỉnh', unit: 'W' },
    { key: 'weightKg', label: 'Trọng lượng', unit: 'kg' },
    { key: 'maxLoadKg', label: 'Tải trọng tối đa', unit: 'kg' },
    { key: 'maxInclinePercent', label: 'Độ dốc tối đa', unit: '%' },
  ],
  battery: [
    { key: 'batteryCapacityAh', label: 'Dung lượng pin', unit: 'Ah' },
    { key: 'batteryVoltageV', label: 'Điện áp pin', unit: 'V' },
    { key: 'batteryType', label: 'Loại pin', unit: '' },
    { key: 'chargingTimeHours', label: 'Thời gian sạc', unit: 'h' },
    { key: 'removableBattery', label: 'Pin rời', unit: '' },
  ],
  chassis: [
    { key: 'frameMaterial', label: 'Chất liệu khung', unit: '' },
    { key: 'wheelSizeInch', label: 'Kích thước bánh', unit: 'inch' },
    { key: 'tireType', label: 'Loại lốp', unit: '' },
    { key: 'brakeFront', label: 'Phanh trước', unit: '' },
    { key: 'brakeRear', label: 'Phanh sau', unit: '' },
    { key: 'suspensionFront', label: 'Giảm xóc trước', unit: '' },
    { key: 'suspensionRear', label: 'Giảm xóc sau', unit: '' },
  ],
  dimensions: [
    { key: 'lengthCm', label: 'Dài', unit: 'cm' },
    { key: 'widthCm', label: 'Rộng', unit: 'cm' },
    { key: 'heightCm', label: 'Cao', unit: 'cm' },
    { key: 'foldedLengthCm', label: 'Dài (gấp)', unit: 'cm' },
    { key: 'foldedWidthCm', label: 'Rộng (gấp)', unit: 'cm' },
    { key: 'foldedHeightCm', label: 'Cao (gấp)', unit: 'cm' },
  ],
  extra: [
    { key: 'maxSpeedUnlockedKmh', label: 'Tốc độ mở khóa', unit: 'km/h' },
    { key: 'lights', label: 'Đèn', unit: '' },
    { key: 'displayType', label: 'Màn hình', unit: '' },
    { key: 'connectivity', label: 'Kết nối', unit: '' },
    { key: 'waterResistanceRating', label: 'Chống nước', unit: '' },
    { key: 'warrantyMonths', label: 'Bảo hành', unit: 'tháng' },
    { key: 'certifications', label: 'Chứng nhận', unit: '' },
  ],
};

const fmt = (val, unit) => {
  if (val == null) return null;
  const n = Number(val);
  if (isNaN(n)) return null;
  if (unit === 'Ah' || unit === 'V') return `${n}`;
  if (unit === 'h') return `${n.toFixed(1)}h`;
  if (unit === 'inch') return `${n.toFixed(1)}"`;
  if (['km/h', 'km', 'W', 'kg', '%', 'tháng'].includes(unit)) return `${n}`;
  if (unit === 'cm') return `${n}`;
  return val;
};

const boolLabel = (v) => {
  if (v === true) return 'Có';
  if (v === false) return 'Không';
  return null;
};

const SpecsSection = ({ product }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const hasSpecs = SPEC_TABS.some((t) =>
    SPEC_GROUPS[t.key].some((s) => product[s.key] != null)
  );

  if (!hasSpecs) return null;

  const fields = SPEC_GROUPS[activeTab] || [];

  return (
    <section className="horizon-pdp__specs horizon-pdp__container">
      <h2>Thông số kỹ thuật</h2>
      <div className="horizon-pdp__specs-tabs">
        {SPEC_TABS.map((tab) => {
          const hasData = SPEC_GROUPS[tab.key].some(
            (s) => product[s.key] != null
          );
          if (!hasData) return null;
          return (
            <button
              key={tab.key}
              type="button"
              className={`horizon-pdp__specs-tab ${activeTab === tab.key ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="horizon-pdp__specs-table">
        <div className="horizon-pdp__specs-table-inner">
          {fields.map((field) => {
            let raw = product[field.key];
            if (field.unit === '' && field.key === 'removableBattery') {
              raw = boolLabel(raw);
            }
            const val = fmt(raw, field.unit);
            if (val == null) return null;
            return (
              <div key={field.key} className="horizon-pdp__specs-row">
                <span className="horizon-pdp__specs-label">{field.label}</span>
                <span className="horizon-pdp__specs-value">
                  {val}{field.unit && val != null ? ` ${field.unit}` : ''}
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

  const variantLabel = 'Version';

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
      setError('Please select a version');
      return;
    }
    // Require color selection if available colors exist
    if (availableColors.length > 0 && !selectedColor) {
      setError('Please select an option');
      return;
    }
    if (!selectedVariant && allVariants.length) {
      setError('Please select product options');
      return;
    }
    if (selectedVariant && (selectedVariant.stockQuantity ?? 0) <= 0) {
      setError('Out of stock');
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

  if (!product) {
    return <div className="horizon-pdp__empty">Product not found.</div>;
  }

  return (
    <div className="horizon-pdp">
      <div className="horizon-pdp__breadcrumb-wrap">
        <div className="horizon-pdp__container">
          <nav className="horizon-pdp__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Electric Scooters</Link>
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
            <p className="horizon-pdp__zoom-hint">Roll over image to zoom in</p>
          </div>
        </div>

        <div className="horizon-pdp__info">
          <h1>{product.name}</h1>

          <div className="horizon-pdp__badges">
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

          {brand && <p className="horizon-pdp__brand">{brand}</p>}

          <div className="horizon-pdp__rating">★★★★★ 24 reviews</div>

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
                Color{selectedColor ? `: ${selectedColor}` : ''}
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
            <span className="label">Price:</span>
            <span className="sale">{formatPriceVND(displayPrice)}</span>
            {hasSale && (
              <span className="regular">{formatPriceVND(basePrice)}</span>
            )}
          </div>

          {error && <p className="horizon-pdp__error">{error}</p>}

          <div className="horizon-pdp__qty-row">
            <span>Quantity:</span>
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
            {inStock ? 'Add to cart' : 'Sold out'}
          </button>

          <button type="button" className="horizon-pdp__paypal">
            Pay with PayPal
          </button>

          <button
            type="button"
            className="horizon-pdp__more-pay"
            onClick={() => setDeliveryOpen(true)}
          >
            More payment options
          </button>

          <div className="horizon-pdp__meta">
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
            className="horizon-pdp__shipping-link"
            onClick={() => setDeliveryOpen(true)}
          >
            Delivery &amp; Return
          </button>
        </div>
      </div>

      {product.description && (
        <section className="horizon-pdp__description horizon-pdp__container">
          <h2>Description</h2>
          <div className="horizon-pdp__description-body">{product.description}</div>
        </section>
      )}

      <SpecsSection product={product} />

      <section className="horizon-pdp__trust">
        <div className="horizon-pdp__container horizon-pdp__trust-grid">
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
        <section className="horizon-pdp__related">
          <div className="horizon-pdp__container">
            <div className="horizon-pdp__related-head">
              <h2>You may also like</h2>
              <Link to="/products" className="horizon-pdp__view-all">
                View all
              </Link>
            </div>
            <div className="horizon-pdp__related-grid">
              {similarProducts.map((item) => (
                <HorizonProductCard
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
