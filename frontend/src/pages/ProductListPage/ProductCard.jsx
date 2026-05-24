import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { FiShoppingCart } from 'react-icons/fi'
import { formatDisplayPrice } from '../../utils/price-format'
import { colorSelector } from '../../components/Filters/ColorFilter'
import { addItemToCartAction } from '../../store/actions/cartAction'
import './ProductCard.css'

const ProductCard = ({
  id,
  name,
  price,
  discount,
  thumbnail,
  newArrival,
  slug,
  variants = [],
}) => {
  const dispatch = useDispatch()
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  const discountValue = discount ? Math.round(discount) : null
  const oldPrice = discountValue ? Math.round(price / (1 - discountValue / 100)) : null

  const colors = useMemo(
    () => [...new Set((variants || []).map((v) => v.color).filter(Boolean))],
    [variants]
  )

  const sizes = useMemo(() => {
    const pool = selectedColor
      ? (variants || []).filter((v) => v.color === selectedColor)
      : variants || []
    return [...new Set(pool.map((v) => v.size).filter(Boolean))]
  }, [variants, selectedColor])

  const hasVariants = colors.length > 0 || sizes.length > 0

  const handleColorClick = (e, color) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedColor((prev) => (prev === color ? '' : color))
    setSelectedSize('')
  }

  const handleSizeClick = (e, size) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSize((prev) => (prev === size ? '' : size))
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variants?.length) return

    const variant = variants.find((v) => {
      const colorMatch = !colors.length || v.color === selectedColor
      const sizeMatch = !sizes.length || v.size === selectedSize
      return colorMatch && sizeMatch
    })

    if (!variant) return
    if (variant.stockQuantity != null && variant.stockQuantity <= 0) return

    dispatch(
      addItemToCartAction({
        productId: id,
        thumbnail,
        name,
        variant,
        quantity: 1,
        price,
      })
    )
  }

  const canAddToCart =
    variants?.length > 0 &&
    (!colors.length || selectedColor) &&
    (!sizes.length || selectedSize)

  return (
    <div className="kalles-card">
      <div className="kalles-card__media">
        <Link to={`/product/${slug}`} className="kalles-card__image-link">
          <div className="kalles-card__image">
            {discountValue > 0 && (
              <span className="kalles-card__badge">-{discountValue}%</span>
            )}
            {newArrival && (
              <span className="kalles-card__badge kalles-card__badge--preorder">
                Pre-Order
              </span>
            )}
            <img src={thumbnail} alt={name} />
          </div>
        </Link>

        {hasVariants && (
          <div
            className="kalles-card__variants"
            onClick={(e) => e.preventDefault()}
          >
            {colors.length > 0 && (
              <div className="kalles-card__variant-row">
                <span className="kalles-card__variant-label">Color</span>
                <div className="kalles-card__swatches">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`kalles-card__swatch ${
                        selectedColor === color ? 'is-active' : ''
                      }`}
                      style={{ background: colorSelector[color] || color }}
                      title={color}
                      aria-label={color}
                      onClick={(e) => handleColorClick(e, color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="kalles-card__variant-row">
                <span className="kalles-card__variant-label">Size</span>
                <div className="kalles-card__sizes">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`kalles-card__size ${
                        selectedSize === size ? 'is-active' : ''
                      }`}
                      onClick={(e) => handleSizeClick(e, size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className={`kalles-card__atc ${canAddToCart ? '' : 'is-disabled'}`}
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <FiShoppingCart size={16} />
              <span>Add to cart</span>
            </button>
          </div>
        )}
      </div>

      <Link to={`/product/${slug}`} className="kalles-card__info">
        <div className="kalles-card__title">{name}</div>
        <div className="kalles-card__price">
          {oldPrice && <span className="old">{formatDisplayPrice(oldPrice)}</span>}
          <span className={oldPrice ? 'current' : ''}>{formatDisplayPrice(price)}</span>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
