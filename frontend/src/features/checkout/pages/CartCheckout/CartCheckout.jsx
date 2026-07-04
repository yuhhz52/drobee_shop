import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartId,
  selectCartLoading,
  fetchCart,
} from '@app/store/slices/cart.jsx';
import { fetchUserDetails } from '@services/user.service';
import { checkoutFromCartAPI } from '@services/cartCheckout.service';
import { setLoading } from '@app/store/slices/common.jsx';
import { formatDisplayPrice } from '@shared/utils/price-format';
import AddAddress from '@features/account/pages/Account/AddAddress';
import '@shared/styles/kalles-shop.css';
import './CartCheckout.css';

const Chevron = () => (
  <span className="kalles-shop__chevron">
    <svg width="5" height="8" viewBox="0 0 5 8" aria-hidden="true">
      <path
        d="M0.887 0L4.887 4L0.887 8L0.177 7.29L3.467 4L0.177 0.71L0.887 0Z"
        fill="currentColor"
      />
    </svg>
  </span>
);

const PAYMENT_OPTIONS = [
  { id: 'COD', label: 'Cash on delivery (COD)' },
  { id: 'VNPAY', label: 'VNPay' },
  { id: 'CARD', label: 'Credit card (Stripe)' },
];

const MESSAGES = {
  ADDRESS_REQUIRED: 'Please select a delivery address.',
  CART_NOT_FOUND: 'Cart not found. Please refresh the page.',
  ORDER_FAILED: 'Order failed. Please try again.',
  VNPAY_FAILED: 'VNPay failed. Please try again.',
  VNPAY_URL_MISSING: 'Payment URL not received. Please try again.',
};

/**
 * Cart checkout page.
 *
 * <p>Reads ONLY from the Redux cart. It never:
 *   - reads {@code sessionStorage.directCheckoutItem}
 *   - uses Buy Now state
 *
 * <p>Place-order calls {@code checkoutFromCartAPI} which targets
 * {@code POST /api/checkout/cart}. On success the backend clears the cart.
 */
const CartCheckout = () => {
  const cartItems = useSelector(selectCartItems);
  const cartId = useSelector(selectCartId);
  const cartLoading = useSelector(selectCartLoading);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState();
  const [addressLoading, setAddressLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [submittingMethod, setSubmittingMethod] = useState('');

  const subTotal = useMemo(() => {
    let value = 0;
    cartItems?.forEach((el) => {
      value += el?.subTotal || (el?.price * el?.quantity) || 0;
    });
    return value;
  }, [cartItems]);

  const itemCount = useMemo(
    () => cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
    [cartItems],
  );

  const refetchUser = useCallback(() => {
    setAddressLoading(true);
    setProfileError('');
    return fetchUserDetails()
      .then((res) => {
        setUserInfo(res);
        if (res?.addressList?.length > 0) {
          const defaultAddr = res.addressList.find((a) => a.isDefault);
          setSelectedAddressId(defaultAddr?.id || res.addressList[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user info:', err);
        setProfileError('Could not load your profile. Please refresh or sign in again.');
      })
      .finally(() => setAddressLoading(false));
  }, []);

  useEffect(() => {
    dispatch(setLoading(false));
    // Refresh the cart snapshot on mount so prices/stock are accurate.
    dispatch(fetchCart());
    refetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceOrder = useCallback(
    async (method) => {
      if (!selectedAddressId) {
        alert(MESSAGES.ADDRESS_REQUIRED);
        return;
      }
      if (!cartId) {
        alert(MESSAGES.CART_NOT_FOUND);
        return;
      }
      try {
        setSubmittingMethod(method);
        const res = await checkoutFromCartAPI({
          cartId,
          addressId: selectedAddressId,
          paymentMethod: method,
        });

        if (method === 'VNPAY') {
          const paymentUrl = res?.credentials?.paymentUrl;
          if (!paymentUrl) {
            alert(MESSAGES.VNPAY_URL_MISSING);
            return;
          }
          window.location.href = paymentUrl;
          return;
        }

        if (method === 'COD') {
          if (res?.orderId) {
            navigate(`/order-confirmed/${res.orderId}?status=success`);
            return;
          }
          alert(MESSAGES.ORDER_FAILED);
        } else if (method === 'CARD') {
          if (res?.credentials?.client_secret && res?.orderId) {
            sessionStorage.setItem(
              'stripePendingOrder',
              JSON.stringify({
                orderId: res.orderId,
                clientSecret: res.credentials.client_secret,
              }),
            );
            navigate(`/cart/checkout/stripe?orderId=${res.orderId}`);
            return;
          }
          alert(MESSAGES.ORDER_FAILED);
        }
      } catch (err) {
        console.error(`${method} error`, err);
        alert(method === 'VNPAY' ? MESSAGES.VNPAY_FAILED : MESSAGES.ORDER_FAILED);
      } finally {
        setSubmittingMethod('');
      }
    },
    [selectedAddressId, cartId, navigate],
  );

  const isBusy = addressLoading || cartLoading || submittingMethod !== '';

  // Cart is empty → back to cart page. The user can add items and retry.
  if (!cartLoading && (!cartItems || cartItems.length === 0)) {
    return <Navigate to="/cart-items" replace />;
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

              <div className="kalles-checkout__actions">
                {paymentMethod === 'COD' && (
                  <button
                    type="button"
                    className="kalles-shop__btn kalles-shop__btn--primary"
                    style={{ width: 'auto', minWidth: '200px' }}
                    onClick={() => handlePlaceOrder('COD')}
                    disabled={!selectedAddressId || !cartId || isBusy}
                  >
                    {submittingMethod === 'COD' ? 'Placing order...' : 'Place order'}
                  </button>
                )}
                {paymentMethod === 'VNPAY' && (
                  <button
                    type="button"
                    className="kalles-shop__btn kalles-shop__btn--vnpay"
                    style={{ width: 'auto', minWidth: '200px' }}
                    onClick={() => handlePlaceOrder('VNPAY')}
                    disabled={!selectedAddressId || !cartId || isBusy}
                  >
                    {submittingMethod === 'VNPAY' ? 'Redirecting...' : 'Pay with VNPay'}
                  </button>
                )}
                {paymentMethod === 'CARD' && (
                  <button
                    type="button"
                    className="kalles-shop__btn kalles-shop__btn--primary"
                    style={{ width: 'auto', minWidth: '200px' }}
                    onClick={() => handlePlaceOrder('CARD')}
                    disabled={!selectedAddressId || !cartId || isBusy}
                  >
                    {submittingMethod === 'CARD' ? 'Preparing payment...' : 'Pay with card'}
                  </button>
                )}
              </div>
            </section>
          </div>

          <aside className="kalles-checkout__summary kalles-shop__summary">
            <h2>Your order ({itemCount})</h2>
            <div style={{ marginBottom: '1rem' }}>
              {cartItems.map((item, index) => (
                <div key={item.id || index} className="kalles-checkout__order-item">
                  {item.thumbnail && <img src={item.thumbnail} alt={item.name} />}
                  <div className="info">
                    <h4>{item.name}</h4>
                    <p>
                      {item.variant?.color}
                      {item.variant?.color && item.variant?.variantName ? ', ' : ''}
                      {item.variant?.variantName}
                    </p>
                    <p className="qty">Quantity: {item.quantity}</p>
                  </div>
                  <span className="price">
                    {formatDisplayPrice(item.subTotal || item.price * item.quantity)}
                  </span>
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
  );
};

export default CartCheckout;
