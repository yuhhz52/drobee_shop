import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { fetchUserDetails } from '@services/user.service';
import { checkoutDirectAPI } from '@services/directCheckout.service';
import { formatDisplayPrice } from '@shared/utils/price-format';
import {
  readDirectCheckoutItem,
  clearDirectCheckoutItem,
} from '@shared/utils/direct-checkout';
import AddAddress from '@features/account/pages/Account/AddAddress';
import '@shared/styles/kalles-shop.css';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './BuyNowCheckout.css';

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

const PAYMENT_OPTIONS = (t) => [
  { id: 'COD', label: t('checkout.payment.COD') },
  { id: 'VNPAY', label: t('checkout.payment.VNPAY') },
  { id: 'CARD', label: t('checkout.payment.CARD') },
];

const MESSAGES = {
  ADDRESS_REQUIRED: 'Please select a delivery address.',
  ORDER_FAILED: 'Order failed. Please try again.',
  VNPAY_FAILED: 'VNPay failed. Please try again.',
  VNPAY_URL_MISSING: 'Payment URL not received. Please try again.',
};

/**
 * Buy Now checkout page.
 *
 * <p>Strictly reads its single item from {@code sessionStorage.directCheckoutItem}.
 * It never:
 *   - touches the Redux cart
 *   - calls the cart API
 *   - uses selectedCartItems
 *
 * <p>If no Buy Now payload exists, the user is bounced to the home page
 * (there is no cart fallback — that is the cart checkout page's job).
 */
const BuyNowCheckout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const directItem = useMemo(() => readDirectCheckoutItem(), []);

  const [userInfo, setUserInfo] = useState();
  const [addressLoading, setAddressLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [submittingMethod, setSubmittingMethod] = useState('');

  const MESSAGES = useMemo(() => ({
    ADDRESS_REQUIRED: t('checkout.messages.addressRequired'),
    ORDER_FAILED: t('checkout.messages.orderFailed'),
    VNPAY_FAILED: t('checkout.messages.vnpayFailed'),
    VNPAY_URL_MISSING: t('checkout.messages.vnpayUrlMissing'),
  }), [t]);
  const paymentOptions = useMemo(() => PAYMENT_OPTIONS(t), [t]);

  const subTotal = useMemo(() => {
    if (!directItem) return 0;
    return (directItem.price || 0) * (directItem.quantity || 0);
  }, [directItem]);

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
        setProfileError(t('checkout.messages.profileLoadFailed'));
      })
      .finally(() => setAddressLoading(false));
  }, [t]);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const buildOrderItems = useCallback(() => {
    if (!directItem) return [];
    const variantId = directItem.variant?.id && directItem.variant.id !== 'default'
      ? directItem.variant.id
      : null;
    return [
      {
        productId: directItem.productId,
        productVariantId: variantId,
        quantity: directItem.quantity,
      },
    ];
  }, [directItem]);

  const handlePlaceOrder = useCallback(async (method) => {
    if (!selectedAddressId) {
      alert(MESSAGES.ADDRESS_REQUIRED);
      return;
    }
    try {
      setSubmittingMethod(method);
      const res = await checkoutDirectAPI({
        addressId: selectedAddressId,
        paymentMethod: method,
        items: buildOrderItems(),
      });

      if (method === 'VNPAY') {
        const paymentUrl = res?.credentials?.paymentUrl;
        if (!paymentUrl) {
          alert(MESSAGES.VNPAY_URL_MISSING);
          return;
        }
        // We DON'T clear sessionStorage here — VNPay may fail, in which case
        // we want to give the user another chance. OrderConfirmedPage handles
        // cleanup on success.
        window.location.href = paymentUrl;
        return;
      }

      // COD and CARD (Stripe) both end up here. CARD gets credentials back
      // and is handled by the embedded Payment component; COD navigates
      // straight to the confirmation page.
      if (method === 'COD') {
        if (res?.orderId) {
          navigate(`/order-confirmed/${res.orderId}?status=success`);
          return;
        }
        alert(MESSAGES.ORDER_FAILED);
      } else if (method === 'CARD') {
        // Stripe credentials are exposed by the backend; the existing
        // Payment component handles the Stripe Elements flow. We hand off
        // the client_secret via a tiny localStorage bridge so the component
        // can pick it up.
        if (res?.credentials?.client_secret && res?.orderId) {
          sessionStorage.setItem(
            'stripePendingOrder',
            JSON.stringify({
              orderId: res.orderId,
              clientSecret: res.credentials.client_secret,
            }),
          );
          navigate(`/buy-now/checkout/stripe?orderId=${res.orderId}`);
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
  }, [selectedAddressId, buildOrderItems, navigate, t]);

  const isBusy = addressLoading || submittingMethod !== '';

  // No Buy Now payload → redirect away. We never fall back to cart here.
  if (!directItem) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="kalles-shop">
      <header className="kalles-shop__head">
        <nav className="kalles-shop__breadcrumb" aria-label={t('common.breadcrumb')}>
          <Link to="/">{t('nav.home')}</Link>
          <Chevron />
          <Link to={`/product/${directItem.slug || ''}`}>{directItem.name}</Link>
          <Chevron />
          <span className="is-current">{t('checkout.buyNowTitle')}</span>
        </nav>
        <h1 className="kalles-shop__title">{t('checkout.buyNowTitle')}</h1>
      </header>

      <div className="kalles-shop__container">
        <div className="kalles-checkout__layout">
          <div>
            <section className="kalles-checkout__section">
              <h2 className="kalles-checkout__section-title">{t('checkout.deliveryAddress')}</h2>
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
                    {t('common.retry')}
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
                    {t('checkout.emptyAddress')}
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
                      {t('common.refresh')}
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="kalles-checkout__section">
              <h2 className="kalles-checkout__section-title">{t('checkout.paymentMethod')}</h2>
              <div className="kalles-checkout__payment-list">
                {paymentOptions.map((opt) => (
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
                    disabled={!selectedAddressId || isBusy}
                  >
                    {submittingMethod === 'COD' ? t('checkout.actions.placingOrder') : t('checkout.actions.placeOrder')}
                  </button>
                )}
                {paymentMethod === 'VNPAY' && (
                  <button
                    type="button"
                    className="kalles-shop__btn kalles-shop__btn--vnpay"
                    style={{ width: 'auto', minWidth: '200px' }}
                    onClick={() => handlePlaceOrder('VNPAY')}
                    disabled={!selectedAddressId || isBusy}
                  >
                    {submittingMethod === 'VNPAY' ? t('checkout.actions.redirecting') : t('checkout.actions.payWithVNPay')}
                  </button>
                )}
                {paymentMethod === 'CARD' && (
                  <button
                    type="button"
                    className="kalles-shop__btn kalles-shop__btn--primary"
                    style={{ width: 'auto', minWidth: '200px' }}
                    onClick={() => handlePlaceOrder('CARD')}
                    disabled={!selectedAddressId || isBusy}
                  >
                    {submittingMethod === 'CARD' ? t('checkout.actions.preparingPayment') : t('checkout.actions.payWithCard')}
                  </button>
                )}
              </div>
            </section>
          </div>

          <aside className="kalles-checkout__summary kalles-shop__summary">
            <h2>{t('checkout.buyNowOrderSummary')}</h2>
            <div style={{ marginBottom: '1rem' }}>
              <div className="kalles-checkout__order-item">
                {directItem.thumbnail && (
                  <img src={directItem.thumbnail} alt={directItem.name} />
                )}
                <div className="info">
                  <h4>{directItem.name}</h4>
                  {directItem.variant && (
                    <p>
                      {directItem.variant.color}
                      {directItem.variant.color && directItem.variant.variantName ? ', ' : ''}
                      {directItem.variant.variantName}
                    </p>
                  )}
                  <p className="qty">{t('checkout.quantity')} {directItem.quantity}</p>
                </div>
                <span className="price">{formatDisplayPrice(subTotal)}</span>
              </div>
            </div>
            <div className="kalles-shop__summary-row">
              <span>{t('checkout.subtotal')}</span>
              <strong>{formatDisplayPrice(subTotal)}</strong>
            </div>
            <div className="kalles-shop__summary-row">
              <span>{t('checkout.shipping')}</span>
              <strong style={{ color: '#2e7d32' }}>{t('checkout.free')}</strong>
            </div>
            <div className="kalles-shop__summary-total">
              <span>{t('checkout.total')}</span>
              <span className="amount">{formatDisplayPrice(subTotal)}</span>
            </div>
            <p className="kalles-checkout__buy-now-note">
              {t('checkout.buyNowNote')}
            </p>
            <button
              type="button"
              className="kalles-cart__continue"
              style={{ display: 'block', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
              onClick={() => {
                clearDirectCheckoutItem();
                navigate('/');
              }}
            >
              {t('checkout.cancelBuyNow')}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BuyNowCheckout;
