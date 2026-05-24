import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi'
import { selectCartItems } from '../../store/features/cart'
import { delteItemFromCartAction, updateItemCartAction } from '../../store/actions/cartAction'
import { formatDisplayPrice } from '../../utils/price-format'
import EmptyCart from '../../assets/images/empty-cart.png'
import '../../styles/kalles-shop.css'
import './Cart.css'

const Chevron = () => (
  <span className="kalles-shop__chevron">
    <svg width="5" height="8" viewBox="0 0 5 8" aria-hidden="true">
      <path
        d="M0.887 0L4.887 4L0.887 8L0.177 7.29L3.467 4L0.177 0.71L0.887 0Z"
        fill="currentColor"
      />
    </svg>
  </span>
)

const CartQty = ({ quantity, onChange, onRemove }) => (
  <div className="kalles-shop__qty">
    <button
      type="button"
      onClick={() => (quantity <= 1 ? onRemove() : onChange(quantity - 1))}
      aria-label="Decrease"
    >
      −
    </button>
    <span>{quantity}</span>
    <button type="button" onClick={() => onChange(quantity + 1)} aria-label="Increase">
      +
    </button>
  </div>
)

const Cart = () => {
  const cartItems = useSelector(selectCartItems)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState({})

  const subTotal = useMemo(() => {
    let value = 0
    cartItems?.forEach((el) => {
      value += el?.subTotal || 0
    })
    return value
  }, [cartItems])

  const itemCount = useMemo(
    () => cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
    [cartItems]
  )

  const onChangeQuantity = useCallback(
    (value, productId, variantId) => {
      dispatch(
        updateItemCartAction({
          productId,
          variant_id: variantId,
          quantity: value,
        })
      )
    },
    [dispatch]
  )

  const onDeleteProduct = useCallback((productId, variantId) => {
    setDeleteItem({ productId, variantId })
    setModalOpen(true)
  }, [])

  const onDeleteItem = useCallback(() => {
    dispatch(delteItemFromCartAction(deleteItem))
    setModalOpen(false)
    setDeleteItem({})
  }, [deleteItem, dispatch])

  if (!cartItems?.length) {
    return (
      <div className="kalles-shop">
        <header className="kalles-shop__head">
          <nav className="kalles-shop__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <Chevron />
            <span className="is-current">Shopping Cart</span>
          </nav>
          <h1 className="kalles-shop__title">Shopping Cart</h1>
        </header>
        <div className="kalles-shop__container">
          <div className="kalles-shop__empty">
            <img src={EmptyCart} alt="Empty cart" />
            <h2>Your cart is empty</h2>
            <p>Looks like you have not added anything to your cart yet.</p>
            <Link to="/products" className="kalles-shop__btn kalles-shop__btn--primary" style={{ width: 'auto', display: 'inline-flex' }}>
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kalles-shop">
      <header className="kalles-shop__head">
        <nav className="kalles-shop__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <Chevron />
          <span className="is-current">Shopping Cart</span>
        </nav>
        <h1 className="kalles-shop__title">
          Shopping Cart
          <span className="kalles-cart__count">({itemCount} items)</span>
        </h1>
      </header>

      <div className="kalles-shop__container">
        <div className="kalles-cart__layout">
          <div>
            <div className="kalles-cart__items kalles-shop__card" style={{ padding: '0 1.25rem' }}>
              {cartItems.map((item, index) => (
                <article
                  key={`${item.productId}-${item.variant?.id || index}`}
                  className="kalles-cart__item"
                >
                  <Link to={`/product/${item.slug || item.productId}`} className="kalles-cart__item-image">
                    <img src={item.thumbnail} alt={item.name} />
                  </Link>

                  <div className="kalles-cart__item-info">
                    <h3>
                      <Link to={`/product/${item.slug || item.productId}`}>{item.name}</Link>
                    </h3>
                    <p className="kalles-cart__item-meta">
                      {item.variant?.color && <span>Color: {item.variant.color}</span>}
                      {item.variant?.color && item.variant?.size && ' · '}
                      {item.variant?.size && <span>Size: {item.variant.size}</span>}
                    </p>
                    <div className="kalles-cart__item-actions">
                      <CartQty
                        quantity={item.quantity}
                        onChange={(v) =>
                          onChangeQuantity(v, item.productId, item.variant?.id)
                        }
                        onRemove={() => onDeleteProduct(item.productId, item.variant?.id)}
                      />
                      <button
                        type="button"
                        className="kalles-cart__remove"
                        onClick={() => onDeleteProduct(item.productId, item.variant?.id)}
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="kalles-cart__item-price">
                    <span className="unit">{formatDisplayPrice(item.price)} each</span>
                    <span className="sub">{formatDisplayPrice(item.subTotal)}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="kalles-cart__coupon">
              <h3>Discount code</h3>
              <p>Enter your coupon code if you have one.</p>
              <div className="kalles-cart__coupon-row">
                <input type="text" className="kalles-shop__input" placeholder="Coupon code" />
                <button type="button" className="kalles-shop__btn kalles-shop__btn--outline" style={{ width: 'auto' }}>
                  Apply
                </button>
              </div>
            </div>

            <Link to="/products" className="kalles-cart__continue">
              <FiArrowLeft size={16} /> Continue shopping
            </Link>
          </div>

          <aside className="kalles-cart__summary kalles-shop__summary">
            <h2>Order summary</h2>
            <div className="kalles-shop__summary-row">
              <span>Subtotal</span>
              <strong>{formatDisplayPrice(subTotal)}</strong>
            </div>
            <div className="kalles-shop__summary-row">
              <span>Shipping</span>
              <strong style={{ color: '#2e7d32' }}>Free</strong>
            </div>
            <div className="kalles-shop__summary-total">
              <span>Total</span>
              <span className="amount">{formatDisplayPrice(subTotal)}</span>
            </div>
            <button
              type="button"
              className="kalles-shop__btn kalles-shop__btn--primary"
              style={{ marginTop: '1.25rem' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to checkout
            </button>
            <p className="kalles-cart__note">Taxes and shipping calculated at checkout.</p>
          </aside>
        </div>
      </div>

      {modalOpen && (
        <>
          <button
            type="button"
            className="kalles-shop__modal-backdrop"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
          />
          <div className="kalles-shop__modal" role="dialog" aria-modal="true">
            <p>Remove this item from your cart?</p>
            <div className="kalles-shop__modal-actions">
              <button
                type="button"
                className="kalles-shop__btn kalles-shop__btn--ghost"
                style={{ width: 'auto' }}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="kalles-shop__btn kalles-shop__btn--danger"
                style={{ width: 'auto' }}
                onClick={onDeleteItem}
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
