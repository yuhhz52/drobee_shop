import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { FiShoppingCart } from 'react-icons/fi'
import { formatDisplayPrice } from '@shared/utils/price-format'
import { colorSelector } from '@shared/components/Filters/ColorFilter'
import { addItemToCartAction } from '@app/store/actions/cartAction'
import { getPrimaryResourceUrl } from '@shared/utils/product-media'
import './ProductCard.css'

const ProductCard = ({
  id,
  name,
  price,
  discount,
  thumbnail,
  productResources,
  newArrival,
  slug,
  variants = [],
}) => {
  const dispatch = useDispatch()
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedVariantName, setSelectedVariantName] = useState('')

  const discountValue = discount ? Math.round(discount) : null
  const oldPrice = discountValue ? Math.round(price / (1 - discountValue / 100)) : null
  const imageUrl = getPrimaryResourceUrl(productResources) || thumbnail

  const colors = useMemo(
    () => [...new Set((variants || []).map((v) => v.color).filter(Boolean))],
    [variants]
  )

  const variantNames = useMemo(() => {
    const pool = selectedColor
      ? (variants || []).filter((v) => v.color === selectedColor)
      : variants || []
    return [...new Set(pool.map((v) => v.variantName).filter(Boolean))]
  }, [variants, selectedColor])

  const hasVariants = colors.length > 0 || variantNames.length > 0

  const handleColorClick = (e, color) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedColor((prev) => (prev === color ? '' : color))
    setSelectedVariantName('')
  }

  const handleVariantClick = (e, variantName) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedVariantName((prev) => (prev === variantName ? '' : variantName))
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variants?.length) return

    const variant = variants.find((v) => {
      const colorMatch = !colors.length || v.color === selectedColor
      const variantMatch = !variantNames.length || v.variantName === selectedVariantName
      return colorMatch && variantMatch
    })

    if (!variant) return
    if (variant.stockQuantity != null && variant.stockQuantity <= 0) return

    dispatch(
      addItemToCartAction({
        productId: id,
        thumbnail: imageUrl,
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
    (!variantNames.length || selectedVariantName)

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
            {imageUrl && <img src={imageUrl} alt={name} />}
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

            {variantNames.length > 0 && (
              <div className="kalles-card__variant-row">
                <span className="kalles-card__variant-label">Version</span>
                <div className="kalles-card__sizes">
                  {variantNames.map((variantName) => (
                    <button
                      key={variantName}
                      type="button"
                      className={`kalles-card__size ${
                        selectedVariantName === variantName ? 'is-active' : ''
                      }`}
                      onClick={(e) => handleVariantClick(e, variantName)}
                    >
                      {variantName}
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
