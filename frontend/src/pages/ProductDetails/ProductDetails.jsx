import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiHeart, FiShuffle } from 'react-icons/fi'
import _ from 'lodash'
import { getAllProducts } from '../../api/fetchProducts.js'
import { addItemToCartAction } from '../../store/actions/cartAction.js'
import { formatDisplayPrice } from '../../utils/price-format'
import { colorSelector } from '../../components/Filters/ColorFilter'
import ProductCard from '../ProductListPage/ProductCard.jsx'
import './ProductDetails.css'

const TRUST_IMG =
  'https://kalles-5-2.myshopify.com/cdn/shop/files/trust_img.png?v=1763135869&width=760'

const Chevron = () => (
  <svg width="5" height="8" viewBox="0 0 5 8" aria-hidden="true">
    <path
      d="M0.887 0L4.887 4L0.887 8L0.177 7.29L3.467 4L0.177 0.71L0.887 0Z"
      fill="currentColor"
    />
  </svg>
)

const ProductModal = ({ title, open, onClose, children }) => {
  if (!open) return null
  return (
    <>
      <button type="button" className="kalles-pdp__modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="kalles-pdp__modal" role="dialog" aria-modal="true">
        <div className="kalles-pdp__modal-header">
          <h3>{title}</h3>
          <button type="button" className="kalles-pdp__modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
              <path d="M15 0L1 14m14 0L1 0" stroke="currentColor" fill="none" />
            </svg>
          </button>
        </div>
        <div className="kalles-pdp__modal-body">{children}</div>
      </div>
    </>
  )
}

const ProductDetails = () => {
  const { product } = useLoaderData()
  const dispatch = useDispatch()
  const categories = useSelector((state) => state?.categoryState?.categories)

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [similarProducts, setSimilarProducts] = useState([])
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)

  const images = useMemo(() => {
    const fromResources = (product?.productResources || [])
      .map((r) => r?.url)
      .filter(Boolean)
    if (fromResources.length) return fromResources
    if (product?.thumbnail) return [product.thumbnail]
    return []
  }, [product])

  const discountPercent = product?.discount ? Math.round(product.discount) : 0
  const comparePrice =
    discountPercent > 0 ? Math.round(product.price / (1 - discountPercent / 100)) : null

  const colors = useMemo(
    () => _.uniq((product?.variants || []).map((v) => v.color).filter(Boolean)),
    [product]
  )

  const sizes = useMemo(() => {
    const pool = selectedColor
      ? (product?.variants || []).filter((v) => v.color === selectedColor)
      : product?.variants || []
    return _.uniq(pool.map((v) => v.size).filter(Boolean))
  }, [product, selectedColor])

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null
    return product.variants.find((v) => {
      const colorOk = !colors.length || v.color === selectedColor
      const sizeOk = !sizes.length || v.size === selectedSize
      return colorOk && sizeOk
    })
  }, [product, colors, sizes, selectedColor, selectedSize])

  const inStock = selectedVariant
    ? (selectedVariant.stockQuantity ?? 1) > 0
    : (product?.variants || []).some((v) => (v.stockQuantity ?? 1) > 0)

  const categoryPath = useMemo(() => {
    const name = (product?.categoryName || '').toLowerCase()
    if (name.includes('nam') || name.includes('men')) return { label: 'Men', path: '/men' }
    if (name.includes('nữ') || name.includes('nu') || name.includes('women'))
      return { label: 'Women', path: '/women' }
    if (name.includes('phụ kiện') || name.includes('accessories'))
      return { label: 'Accessories', path: '/accessories' }
    return { label: 'All', path: '/products' }
  }, [product?.categoryName])

  useEffect(() => {
    if (!product?.id) return
    getAllProducts({
      categoryId: product.categoryId,
      typeIds: product.categoryTypeId ? [product.categoryTypeId] : [],
      size: 8,
    })
      .then((res) => {
        setSimilarProducts((res.products || []).filter((p) => p.id !== product.id).slice(0, 8))
      })
      .catch(() => setSimilarProducts([]))
  }, [product])

  useEffect(() => {
    setActiveImageIndex(0)
    setSelectedSize('')
    setSelectedColor('')
    setQuantity(1)
    setError('')
  }, [product?.id])

  useEffect(() => {
    if (selectedSize || selectedColor) setError('')
  }, [selectedSize, selectedColor])

  const goImage = (dir) => {
    if (!images.length) return
    setActiveImageIndex((i) => {
      const next = i + dir
      if (next < 0) return images.length - 1
      if (next >= images.length) return 0
      return next
    })
  }

  const addItemToCart = useCallback(() => {
    if (sizes.length && !selectedSize) {
      setError('Please select a size')
      return
    }
    if (colors.length && !selectedColor) {
      setError('Please select a color')
      return
    }
    if (!selectedVariant) {
      setError('Please select product options')
      return
    }
    if ((selectedVariant.stockQuantity ?? 0) <= 0) {
      setError('Out of stock')
      return
    }

    dispatch(
      addItemToCartAction({
        productId: product.id,
        thumbnail: product.thumbnail,
        name: product.name,
        variant: selectedVariant,
        quantity,
        price: product.price,
      })
    )
    setError('')
  }, [dispatch, product, selectedVariant, selectedSize, selectedColor, sizes, colors, quantity])

  if (!product) {
    return <div className="kalles-pdp__empty">Product not found.</div>
  }

  const activeImage = images[activeImageIndex] || product.thumbnail
  const nextSimilar = similarProducts[0]

  return (
    <div className="kalles-pdp">
      <nav className="kalles-pdp__breadcrumb" aria-label="Breadcrumb">
        <div className="kalles-pdp__breadcrumb-inner">
          <div className="kalles-pdp__breadcrumb-list">
            <Link to="/">Home</Link>
            <Chevron />
            <Link to={categoryPath.path}>{categoryPath.label}</Link>
            <Chevron />
            <span className="is-current">{product.name}</span>
          </div>
          <div className="kalles-pdp__breadcrumb-actions">
            <Link to={categoryPath.path} title="Back to collection" aria-label="Back to collection">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </Link>
            {nextSimilar?.slug && (
              <Link
                to={`/product/${nextSimilar.slug}`}
                title={nextSimilar.name}
                aria-label="Next product"
              >
                <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M12.969 4.281L11.531 5.718L21.812 16L11.531 26.281L12.969 27.718L23.969 16.718L24.656 16L23.969 15.281Z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="kalles-pdp__main">
        <div className="kalles-pdp__media">
          {images.length > 1 && (
            <div className="kalles-pdp__thumbs">
              {images.map((url, index) => (
                <button
                  key={url + index}
                  type="button"
                  className={`kalles-pdp__thumb ${activeImageIndex === index ? 'is-active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="kalles-pdp__main-image">
            {discountPercent > 0 && (
              <span className="kalles-pdp__badge">-{discountPercent}%</span>
            )}
            {product.newArrival && (
              <span className="kalles-pdp__badge kalles-pdp__badge--new">New</span>
            )}
            <img src={activeImage} alt={product.name} />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="kalles-pdp__nav kalles-pdp__nav--prev"
                  onClick={() => goImage(-1)}
                  aria-label="Previous image"
                >
                  <svg width="7" height="11" viewBox="0 0 7 11" fill="currentColor">
                    <path d="M5.5 11L0 5.5L5.5 0L6.476 0.976L1.952 5.5L6.476 10.024L5.5 11Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="kalles-pdp__nav kalles-pdp__nav--next"
                  onClick={() => goImage(1)}
                  aria-label="Next image"
                >
                  <svg width="7" height="11" viewBox="0 0 7 11" fill="currentColor">
                    <path d="M1.5 11L7 5.5L1.5 0L0.524 0.976L5.048 5.5L0.524 10.024L1.5 11Z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="kalles-pdp__info">
          <h1 className="kalles-pdp__title">{product.name}</h1>

          <div className="kalles-pdp__price">
            {comparePrice && (
              <span className="compare">{formatDisplayPrice(comparePrice)}</span>
            )}
            <span className={`current ${comparePrice ? 'on-sale' : ''}`}>
              {formatDisplayPrice(product.price)}
            </span>
          </div>

          {product.description && (
            <p className="kalles-pdp__desc">
              {product.description.length > 220
                ? `${product.description.slice(0, 220)}...`
                : product.description}
            </p>
          )}

          {sizes.length > 0 && (
            <div className="kalles-pdp__variant">
              <div className="kalles-pdp__variant-label">
                <span>Size</span>
                <button type="button" onClick={() => setSizeGuideOpen(true)}>
                  Size Guide
                </button>
              </div>
              <div className="kalles-pdp__sizes">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`kalles-pdp__size ${selectedSize === size ? 'is-active' : ''}`}
                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="kalles-pdp__variant">
              <p className="kalles-pdp__variant-label">
                <span>Color{selectedColor ? `: ${selectedColor}` : ''}</span>
              </p>
              <div className="kalles-pdp__colors">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`kalles-pdp__swatch ${selectedColor === color ? 'is-active' : ''}`}
                    style={{ background: colorSelector[color] || color }}
                    title={color}
                    aria-label={color}
                    onClick={() => {
                      setSelectedColor(selectedColor === color ? '' : color)
                      setSelectedSize('')
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && <p className="kalles-pdp__error">{error}</p>}

          <div className="kalles-pdp__buy">
            <div className="kalles-pdp__qty">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                aria-label="Quantity"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="kalles-pdp__atc"
              onClick={addItemToCart}
              disabled={!inStock}
            >
              {inStock ? 'Add to cart' : 'Sold out'}
            </button>

            <div className="kalles-pdp__icon-btns">
              <button type="button" className="kalles-pdp__icon-btn" aria-label="Add to wishlist">
                <FiHeart size={20} />
              </button>
              <button type="button" className="kalles-pdp__icon-btn" aria-label="Add to compare">
                <FiShuffle size={18} />
              </button>
            </div>
          </div>

          <div className="kalles-pdp__trust">
            <img src={TRUST_IMG} alt="Secure checkout" loading="lazy" />
          </div>

          <div className="kalles-pdp__links">
            <button type="button" onClick={() => setSizeGuideOpen(true)}>
              Size Guide
            </button>
            <button type="button" onClick={() => setDeliveryOpen(true)}>
              Delivery &amp; Return
            </button>
          </div>

          <div className="kalles-pdp__meta">
            <p>
              Availability:{' '}
              <span className={inStock ? 'in-stock' : 'out-stock'}>
                {inStock ? 'In stock' : 'Out of stock'}
              </span>
            </p>
            {selectedVariant && (
              <p>
                SKU: <span>{selectedVariant.id?.slice(0, 8) || product.slug}</span>
              </p>
            )}
            <p>
              Categories:{' '}
              <Link to={categoryPath.path}>{categoryPath.label}</Link>
              {product.categoryTypeName && (
                <span> / {product.categoryTypeName}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {product.description && (
        <section className="kalles-pdp__accordion">
          <details open>
            <summary>Description</summary>
            <div className="content">{product.description}</div>
          </details>
          <details>
            <summary>Shipping &amp; Returns</summary>
            <div className="content">
              <p>Free shipping on orders over 2,000,000₫. Standard delivery 3–5 business days.</p>
              <p>Returns accepted within 14 days in original condition.</p>
            </div>
          </details>
        </section>
      )}

      {similarProducts.length > 0 && (
        <section className="kalles-pdp__related">
          <h3>You may also like</h3>
          <div className="kalles-pdp__related-grid">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} {...item} title={item.name} />
            ))}
          </div>
        </section>
      )}

      <ProductModal title="Size Guide" open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)}>
        <p>Measure carefully before ordering. For scooter gear, refer to manufacturer sizing charts.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Size</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>US</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>EU</th>
            </tr>
          </thead>
          <tbody>
            {['XS', 'S', 'M', 'L', 'XL'].map((s, i) => (
              <tr key={s} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{s}</td>
                <td style={{ padding: '0.5rem' }}>{2 + i * 2}</td>
                <td style={{ padding: '0.5rem' }}>{34 + i * 2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ProductModal>

      <ProductModal title="Delivery & Return" open={deliveryOpen} onClose={() => setDeliveryOpen(false)}>
        <h4>Delivery</h4>
        <ul>
          <li>All orders shipped with express courier.</li>
          <li>Free shipping for orders over 2,000,000₫.</li>
          <li>Tracking number provided for every order.</li>
        </ul>
        <h4>Returns</h4>
        <ul>
          <li>Items returned within 14 days in same condition are eligible for refund.</li>
          <li>Refunds processed to the original payment method.</li>
          <li>Customer pays return shipping unless item is defective.</li>
        </ul>
      </ProductModal>
    </div>
  )
}

export default ProductDetails
