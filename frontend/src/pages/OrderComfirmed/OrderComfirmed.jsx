import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchOrderAPI } from '../../api/userInfo.js'
import { useSelector, useDispatch } from 'react-redux'
import { deleteCart } from '../../store/features/cart'
import Spinner from '../../components/Spinner/Spinner.jsx'
import { formatDisplayPrice } from '../../utils/price-format'
import '../../styles/kalles-shop.css'
import './OrderConfirmed.css'

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

const OrderConfirmed = () => {
  const location = useLocation()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const isLoading = useSelector((state) => state.commonState.loading)
  const dispatch = useDispatch()

  const { orderId, status } = useMemo(() => {
    const query = new URLSearchParams(location.search)
    return {
      orderId: query.get('orderId'),
      status: query.get('status'),
    }
  }, [location.search])

  useEffect(() => {
    if (!orderId) return
    fetchOrderAPI()
      .then((orders) => {
        const found = orders.find((o) => String(o.id) === String(orderId))
        if (found) {
          setOrder(found)
          dispatch(deleteCart())
        } else {
          setError('Order not found.')
        }
      })
      .catch(() => setError('Failed to load order details.'))
  }, [orderId, dispatch])

  if (isLoading) {
    return (
      <div className="kalles-shop">
        <div className="kalles-shop__container" style={{ textAlign: 'center', padding: '4rem' }}>
          <Spinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="kalles-shop">
        <div className="kalles-shop__container">
          <p className="kalles-order__error">{error}</p>
          <Link to="/products" className="kalles-shop__btn kalles-shop__btn--primary" style={{ width: 'auto', display: 'inline-flex' }}>
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  const isPaymentSuccess = status === 'success' || !status
  const isPaymentFail = status === 'fail'

  return (
    <div className="kalles-shop">
      <header className="kalles-shop__head">
        <nav className="kalles-shop__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <Chevron />
          <span className="is-current">Order confirmed</span>
        </nav>
        <h1 className="kalles-shop__title">Order confirmed</h1>
      </header>

      <div className="kalles-shop__container" style={{ maxWidth: '800px' }}>
        <div className={`kalles-order__success ${isPaymentFail ? 'kalles-order__success--fail' : ''}`}
          style={isPaymentFail ? { borderColor: '#ffcdd2', background: '#fff5f5', color: '#c62828' } : undefined}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            {isPaymentFail ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            )}
          </svg>
          <div>
            <h2>{isPaymentFail ? 'Payment issue' : 'Thank you for your order!'}</h2>
            <p>
              Order ID: <strong>{order?.orderDisplayCode || order?.id}</strong>
            </p>
          </div>
        </div>

        <div className="kalles-order__meta">
          {order?.orderDate && (
            <p>Order date: {new Date(order.orderDate).toLocaleString()}</p>
          )}
          {isPaymentSuccess && order?.paymentMethod === 'VNPAY' && (
            <p style={{ color: '#2e7d32' }}>VNPay payment successful. Thank you!</p>
          )}
          {isPaymentFail && order?.paymentMethod === 'VNPAY' && (
            <p style={{ color: '#e81e1e' }}>VNPay payment failed. Please try again.</p>
          )}
          {order?.paymentMethod === 'COD' && (
            <p>
              Pay on delivery: <strong>{formatDisplayPrice(order?.totalAmount)}</strong>
            </p>
          )}
          {order?.paymentMethod?.startsWith('pm_') && isPaymentSuccess && (
            <p>
              Paid: <strong>{formatDisplayPrice(order?.totalAmount)}</strong>
            </p>
          )}
        </div>

        <div className="kalles-order__panel">
          <h3>Order details</h3>
          <div className="kalles-order__details">
            <p>Order ID: <strong>{order?.orderDisplayCode || order?.id}</strong></p>
            <p>Total: <strong>{formatDisplayPrice(order?.totalAmount)}</strong></p>
            <p>Shipping: <strong>Free</strong></p>
            <p>Status: <strong>{order?.orderStatus}</strong></p>
          </div>

          <div className="kalles-order__items">
            {order?.orderItemList?.map((item, idx) => {
              const variant = item?.product?.variants?.find(
                (v) => String(v.id) === String(item.productVariantId)
              )
              const image =
                item?.product?.productResources?.[0]?.url || item?.product?.thumbnail

              return (
                <article key={idx} className="kalles-order__item">
                  {image && <img src={image} alt={item?.product?.name} />}
                  <div>
                    <h4>{item?.product?.name}</h4>
                    <p>Qty: {item?.quantity}</p>
                    <p>Price: {formatDisplayPrice(item?.product?.price)}</p>
                    {variant?.color && <p>Color: {variant.color}</p>}
                    {variant?.size && <p>Size: {variant.size}</p>}
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {order?.address && (
          <div className="kalles-order__address">
            <h3>Delivery address</h3>
            <p>{order.address.name}</p>
            <p>{order.address.street}</p>
            <p>
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </p>
          </div>
        )}

        <div className="kalles-order__actions">
          <Link to="/products" className="kalles-shop__btn kalles-shop__btn--primary" style={{ width: 'auto' }}>
            Continue shopping
          </Link>
          <Link to="/account-details/orders" className="kalles-shop__btn kalles-shop__btn--outline" style={{ width: 'auto' }}>
            View my orders
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmed
