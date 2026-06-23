import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { selectCartItems, selectCartId, selectCartLoading, fetchCart } from '@app/store/slices/cart.jsx'
import { fetchUserDetails } from '@services/user.service'
import { setLoading } from '@app/store/slices/common.jsx'
import { clearTokens } from '@shared/utils/jwt-helper'
import Payment from '@features/payment/pages/Payment/Payment'
import { checkoutFromCartAPI, checkoutDirectAPI } from '@services/order.service'
import { formatDisplayPrice } from '@shared/utils/price-format'
import AddAddress from '@features/account/pages/Account/AddAddress'
import '@shared/styles/kalles-shop.css';
import './Checkout.css'

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

const PAYMENT_OPTIONS = [
  { id: 'COD', label: 'Cash on delivery (COD)' },
  { id: 'VNPAY', label: 'VNPay' },
  { id: 'CARD', label: 'Credit card (Stripe)' },
]

const MESSAGES = {
  ADDRESS_REQUIRED: 'Please select a delivery address.',
  ORDER_FAILED: 'Order failed. Please try again.',
  VNPAY_FAILED: 'VNPay failed. Please try again.',
  VNPAY_URL_MISSING: 'Payment URL not received. Please try again.',
}

const Checkout = () => {
  const cartItems = useSelector(selectCartItems)
  const cartId = useSelector(selectCartId)
  const cartLoading = useSelector(selectCartLoading)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState()
  const [addressLoading, setAddressLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [submittingMethod, setSubmittingMethod] = useState('')

  // Check for direct checkout item from Buy Now flow
  const directCheckoutItem = useMemo(() => {
    const item = sessionStorage.getItem('directCheckoutItem')
    return item ? JSON.parse(item) : null
  }, [])

  // If direct checkout, use that item instead of cart
  const displayItems = directCheckoutItem ? [directCheckoutItem] : cartItems
  const isDirectCheckout = !!directCheckoutItem

  const subTotal = useMemo(() => {
    let value = 0
    displayItems?.forEach((el) => {
      value += el?.subTotal || (el?.price * el?.quantity) || 0
    })
    return value
  }, [displayItems])

  const itemCount = useMemo(
    () => displayItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
    [displayItems]
  )

  const refetchUser = useCallback(() => {
    setAddressLoading(true)
    setProfileError('')
    return fetchUserDetails()
      .then((res) => {
        setUserInfo(res)
        // Auto-select default address or first address
        if (res?.addressList?.length > 0) {
          const defaultAddr = res.addressList.find((a) => a.isDefault)
          setSelectedAddressId(defaultAddr?.id || res.addressList[0].id)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user info:', err)
        const status = err?.response?.status
        if (status === 401 || status === 403) {
          clearTokens()
          navigate('/v1/login', { replace: true, state: { from: '/checkout' } })
          return
        }
        setProfileError('Could not load your profile. Please refresh or sign in again.')
      })
      .finally(() => setAddressLoading(false))
  }, [navigate])

  useEffect(() => {
    dispatch(setLoading(false))
    // Fetch cart and user profile in parallel for better performance
    Promise.all([
      dispatch(fetchCart()),
      refetchUser(),
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCODPayment = async () => {
    if (!selectedAddressId) {
      alert(MESSAGES.ADDRESS_REQUIRED)
      return
    }
    try {
      setSubmittingMethod('COD')
      let res
      if (isDirectCheckout) {
        // Direct checkout - don't require cartId
        res = await checkoutDirectAPI({
          addressId: selectedAddressId,
          paymentMethod: 'COD',
          items: displayItems.map((item) => ({
            productId: item.productId,
            productVariantId: item.variant?.id === 'default' ? null : item.variant?.id,
            quantity: item.quantity,
          })),
        })
      } else {
        if (!cartId) {
          alert('Cart not found. Please refresh the page.')
          return
        }
        res = await checkoutFromCartAPI({
          cartId,
          addressId: selectedAddressId,
          paymentMethod: 'COD',
        })
      }
      if (res?.orderId) {
        sessionStorage.removeItem('directCheckoutItem')
        navigate(`/orderConfirmed?orderId=${res.orderId}`)
      } else {
        alert(MESSAGES.ORDER_FAILED)
      }
    } catch {
      alert(MESSAGES.ORDER_FAILED)
    } finally {
      setSubmittingMethod('')
    }
  }

  const handleVNPayPayment = async () => {
    if (!selectedAddressId) {
      alert(MESSAGES.ADDRESS_REQUIRED)
      return
    }
    try {
      setSubmittingMethod('VNPAY')
      let res
      if (isDirectCheckout) {
        // Direct checkout - don't require cartId
        res = await checkoutDirectAPI({
          addressId: selectedAddressId,
          paymentMethod: 'VNPAY',
          items: displayItems.map((item) => ({
            productId: item.productId,
            productVariantId: item.variant?.id === 'default' ? null : item.variant?.id,
            quantity: item.quantity,
          })),
        })
      } else {
        if (!cartId) {
          alert('Cart not found. Please refresh the page.')
          return
        }
        res = await checkoutFromCartAPI({
          cartId,
          addressId: selectedAddressId,
          paymentMethod: 'VNPAY',
        })
      }
      const paymentUrl = res?.credentials?.paymentUrl
      if (paymentUrl) {
        sessionStorage.removeItem('directCheckoutItem')
        window.location.href = paymentUrl
      } else {
        alert(MESSAGES.VNPAY_URL_MISSING)
      }
    } catch (err) {
      console.error('VNPay error', err)
      alert(MESSAGES.VNPAY_FAILED)
    } finally {
      setSubmittingMethod('')
    }
  }

  const isBusy = addressLoading || cartLoading || submittingMethod !== ''

  // Don't redirect to cart if we're in direct checkout (Buy Now) flow
  if (!displayItems?.length) {
    return <Navigate to="/cart-items" replace />
  }

  return (
    <div className="kalles-shop">
      <header className="kalles-shop__head">
        <nav className="kalles-shop__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <Chevron />
          <Link to="/cart-items">Shopping Cart</Link>
          <Chevron />
          <span className="is-current">Checkout</span>
        </nav>
        <h1 className="kalles-shop__title">Checkout</h1>
      </header>

      <div className="kalles-shop__container">
        <div className="kalles-checkout__layout">
          <div>
            <section className="kalles-checkout__section">
              <h2 className="kalles-checkout__section-title">Delivery address</h2>
              {addressLoading ? (
                <div className="kalles-checkout__loading">
                  <div className="kalles-checkout__loading-skeleton"></div>
                  <div className="kalles-checkout__loading-skeleton"></div>
                </div>
              ) : profileError ? (
                <div className="kalles-checkout__empty-hint" style={{ color: '#c62828' }}>
                  <p style={{ margin: '0 0 0.75rem' }}>{profileError}</p>
                  <button
                    type="button"
                    onClick={() => refetchUser()}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--kalles-dark)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : userInfo?.addressList?.length > 0 ? (
                <div className="kalles-checkout__address-list">
                  {userInfo.addressList.map((address) => (
                    <label
                      key={address.id}
                      className={`kalles-checkout__address-card ${
                        selectedAddressId === address.id ? 'is-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      <div>
                        <p className="name">
                          {address.name} — {address.phoneNumber}
                        </p>
                        <p className="detail">
                          {address.street}, {address.wardName}, {address.provinceName}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="kalles-checkout__empty-hint">
                  <p style={{ margin: '0 0 0.75rem' }}>
                    You have no saved address. Add one to continue checkout.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <AddAddress onSaved={refetchUser} />
                    <button
                      type="button"
                      onClick={() => refetchUser()}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        color: 'var(--kalles-dark)',
                        border: '1px solid var(--kalles-border)',
                        cursor: 'pointer',
                      }}
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="kalles-checkout__section">
              <h2 className="kalles-checkout__section-title">Payment method</h2>
              <div className="kalles-checkout__payment-list">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`kalles-checkout__payment-option ${
                      paymentMethod === opt.id ? 'is-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      disabled={isBusy}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {paymentMethod === 'CARD' && selectedAddressId && (
                <div className="kalles-checkout__stripe">
                  <Payment userId={userInfo?.id} addressId={selectedAddressId} />
                </div>
              )}

              <div className="kalles-checkout__actions">
                {paymentMethod === 'COD' && (
                  <button
                    type="button"
                    className="kalles-shop__btn kalles-shop__btn--primary"
                    style={{ width: 'auto', minWidth: '200px' }}
                    onClick={handleCODPayment}
                    disabled={!selectedAddressId || isBusy}
                  >
                    {submittingMethod === 'COD' ? 'Placing order...' : 'Place order'}
                  </button>
                )}
                {paymentMethod === 'VNPAY' && (
                  <button
                    type="button"
                    className="kalles-shop__btn kalles-shop__btn--vnpay"
                    style={{ width: 'auto', minWidth: '200px' }}
                    onClick={handleVNPayPayment}
                    disabled={!selectedAddressId || isBusy}
                  >
                    {submittingMethod === 'VNPAY' ? 'Redirecting...' : 'Pay with VNPay'}
                  </button>
                )}
              </div>
            </section>
          </div>

          <aside className="kalles-checkout__summary kalles-shop__summary">
            <h2>Your order ({itemCount})</h2>
            <div style={{ marginBottom: '1rem' }}>
              {displayItems.map((item, index) => (
                <div key={index} className="kalles-checkout__order-item">
                  <img src={item.thumbnail} alt={item.name} />
                  <div className="info">
                    <h4>{item.name}</h4>
                    <p>
                      {item.variant?.color}
                      {item.variant?.color && item.variant?.variantName ? ', ' : ''}
                      {item.variant?.variantName}
                    </p>
                    <p className="qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="price">{formatDisplayPrice(item.subTotal || (item.price * item.quantity))}</span>
                </div>
              ))}
            </div>
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
            <Link
              to="/cart-items"
              className="kalles-cart__continue"
              style={{ display: 'block', marginTop: '1rem' }}
            >
              ← Back to cart
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Checkout
