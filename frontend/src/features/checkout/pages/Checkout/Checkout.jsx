import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { selectCartItems } from '@app/store/slices/cart.jsx'
import { fetchUserDetails } from '@services/user.service'
import { setLoading } from '@app/store/slices/common.jsx'
import Payment from '@features/payment/pages/Payment/Payment'
import { placeOrderAPI } from '@services/order.service'
import { createOrderRequest } from '@shared/utils/order-util'
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

const Checkout = () => {
  const cartItems = useSelector(selectCartItems)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState()
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selectedAddressId, setSelectedAddressId] = useState(null)

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

  const refetchUser = () => {
    dispatch(setLoading(true))
    fetchUserDetails()
      .then((res) => {
        setUserInfo(res)
        if (res?.addressList?.length > 0) {
          setSelectedAddressId(res.addressList[0].id)
        }
      })
      .catch((err) => console.error('Failed to fetch user info:', err))
      .finally(() => dispatch(setLoading(false)))
  }

  useEffect(() => {
    refetchUser()
  }, [dispatch])

  const handleCODPayment = async () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address.')
      return
    }
    try {
      dispatch(setLoading(true))
      const orderRequest = createOrderRequest(cartItems, userInfo?.id, selectedAddressId)
      orderRequest.paymentMethod = 'COD'
      const res = await placeOrderAPI(orderRequest)
      navigate(`/orderConfirmed?orderId=${res?.orderId}`)
    } catch {
      alert('Order failed. Please try again.')
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleVNPayPayment = async () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address.')
      return
    }
    try {
      dispatch(setLoading(true))
      const orderRequest = createOrderRequest(cartItems, userInfo?.id, selectedAddressId)
      orderRequest.paymentMethod = 'VNPAY'
      const res = await placeOrderAPI(orderRequest)
      const paymentUrl = res?.credentials?.paymentUrl
      if (paymentUrl) {
        window.location.href = paymentUrl
      } else {
        alert('Payment URL not received. Please try again.')
      }
    } catch (err) {
      alert(`VNPay failed: ${err.message || 'Connection error'}`)
    } finally {
      dispatch(setLoading(false))
    }
  }

  if (!cartItems?.length) {
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
              {userInfo?.addressList?.length > 0 ? (
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
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="kalles-checkout__empty-hint">
                  <p style={{ margin: '0 0 1rem' }}>
                    You have no saved address. Add one to continue checkout.
                  </p>
                  <AddAddress onCancel={refetchUser} />
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
                    disabled={!selectedAddressId}
                  >
                    Place order
                  </button>
                )}
                {paymentMethod === 'VNPAY' && (
                  <button
                    type="button"
                    className="kalles-shop__btn kalles-shop__btn--vnpay"
                    style={{ width: 'auto', minWidth: '200px' }}
                    onClick={handleVNPayPayment}
                    disabled={!selectedAddressId}
                  >
                    Pay with VNPay
                  </button>
                )}
              </div>
            </section>
          </div>

          <aside className="kalles-checkout__summary kalles-shop__summary">
            <h2>Your order ({itemCount})</h2>
            <div style={{ marginBottom: '1rem' }}>
              {cartItems.map((item, index) => (
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
                  <span className="price">{formatDisplayPrice(item.subTotal)}</span>
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
