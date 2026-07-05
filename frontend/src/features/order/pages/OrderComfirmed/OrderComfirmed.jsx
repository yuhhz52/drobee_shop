import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fetchOrderAPI } from '@services/user.service';
import { useSelector } from 'react-redux';
import Spinner from '@shared/components/Spinner/Spinner.jsx';
import { formatDisplayPrice } from '@shared/utils/price-format';
import { getPrimaryResourceUrl } from '@shared/utils/product-media';
import { clearDirectCheckoutItem } from '@shared/utils/direct-checkout';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import '@shared/styles/kalles-shop.css';
import './OrderConfirmed.css';

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

/**
 * Order confirmation page.
 *
 * <p>Strict responsibilities:
 *   - Display order info, payment status, and shipping address.
 *   - Clean up {@code sessionStorage.directCheckoutItem} if present
 *     (the Buy Now flow has now ended successfully).
 *
 * <p>This page NEVER:
 *   - Calls the checkout API.
 *   - Calls {@code clearCart}.
 *   - Refreshes the cart.
 *   - Creates a new order.
 *
 * <p>Refreshing the page is safe — it just re-fetches the order by id.
 */
const OrderConfirmed = () => {
  const { t } = useTranslation();
  const { orderId: pathOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const paymentError = searchParams.get('error');

  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const isLoading = useSelector((state) => state.commonState.loading);

  // Path param takes precedence; fall back to query param for backward
  // compatibility with any old links still floating around.
  const orderId = pathOrderId || searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setError(t('orderConfirmed.missingOrderId'));
      return;
    }

    let cancelled = false;
    fetchOrderAPI()
      .then((orders) => {
        if (cancelled) return;
        const found = orders.find((o) => String(o.id) === String(orderId));
        if (found) {
          setOrder(found);
          // Buy Now cleanup: if the sessionStorage payload still exists, the
          // user reached us via the Buy Now flow — clear it now that the
          // order has been placed. Cart cleanup (if applicable) was already
          // performed by the backend in the same transaction as order creation.
          clearDirectCheckoutItem();
          sessionStorage.removeItem('stripePendingOrder');
        } else {
          setError(t('orderConfirmed.orderNotFound'));
        }
      })
      .catch(() => {
        if (!cancelled) setError(t('orderConfirmed.loadFailed'));
      });

    return () => { cancelled = true; };
  }, [orderId, t]);

  if (isLoading) {
    return (
      <div className="kalles-shop">
        <div className="kalles-shop__container" style={{ textAlign: 'center', padding: '4rem' }}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kalles-shop">
        <div className="kalles-shop__container">
          <p className="kalles-order__error">{error}</p>
          <Link
            to="/products"
            className="kalles-shop__btn kalles-shop__btn--primary"
            style={{ width: 'auto', display: 'inline-flex' }}
          >
            {t('orderConfirmed.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentSuccess = status === 'success' || !status;
  const isPaymentFail = status === 'fail';

  return (
    <div className="kalles-shop">
      <header className="kalles-shop__head">
        <nav className="kalles-shop__breadcrumb" aria-label={t('common.breadcrumb')}>
          <Link to="/">{t('nav.home')}</Link>
          <Chevron />
          <span className="is-current">{t('orderConfirmed.breadcrumb')}</span>
        </nav>
        <h1 className="kalles-shop__title">{t('orderConfirmed.title')}</h1>
      </header>

      <div className="kalles-shop__container" style={{ maxWidth: '800px' }}>
        <div
          className={`kalles-order__success ${isPaymentFail ? 'kalles-order__success--fail' : ''}`}
          style={isPaymentFail ? { borderColor: '#ffcdd2', background: '#fff5f5', color: '#c62828' } : undefined}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            {isPaymentFail ? (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            )}
          </svg>
          <div>
            <h2>{isPaymentFail ? t('orderConfirmed.paymentIssue') : t('orderConfirmed.thankYou')}</h2>
            <p>
              {t('orderConfirmed.orderCode')} <strong>{order?.orderDisplayCode || order?.id}</strong>
            </p>
          </div>
        </div>

        <div className="kalles-order__meta">
          {order?.orderDate && (
            <p>{t('orderConfirmed.orderDate')}: {new Date(order.orderDate).toLocaleString()}</p>
          )}
          {paymentError && (
            <p style={{ color: '#c62828' }}>{t('orderConfirmed.paymentError')}: {paymentError}</p>
          )}
          {isPaymentSuccess && order?.paymentMethod === 'VNPAY' && (
            <p style={{ color: '#2e7d32' }}>{t('orderConfirmed.vnpaySuccess')}</p>
          )}
          {isPaymentFail && order?.paymentMethod === 'VNPAY' && (
            <p style={{ color: '#e81e1e' }}>{t('orderConfirmed.vnpayFailed')}</p>
          )}
          {order?.paymentMethod === 'COD' && (
            <p>
              {t('orderConfirmed.payOnDelivery')} <strong>{formatDisplayPrice(order?.totalAmount)}</strong>
            </p>
          )}
          {order?.paymentMethod?.startsWith('pm_') && isPaymentSuccess && (
            <p>
              {t('orderConfirmed.paid')} <strong>{formatDisplayPrice(order?.totalAmount)}</strong>
            </p>
          )}
        </div>

        <div className="kalles-order__panel">
          <h3>{t('account.orderDetails')}</h3>
          <div className="kalles-order__details">
            <p>{t('orderConfirmed.orderCode')} <strong>{order?.orderDisplayCode || order?.id}</strong></p>
            <p>{t('orderConfirmed.totalAmount')} <strong>{formatDisplayPrice(order?.totalAmount)}</strong></p>
            <p>{t('orderConfirmed.shipping')} <strong>{t('orderConfirmed.free')}</strong></p>
            <p>{t('orderConfirmed.status')} <strong>{order?.orderStatus}</strong></p>
          </div>

          <div className="kalles-order__items">
            {order?.orderItemList?.map((item, idx) => {
              const variant = item?.product?.variants?.find(
                (v) => String(v.id) === String(item.productVariantId),
              );
              const image = getPrimaryResourceUrl(item?.product?.productResources);
              return (
                <article key={idx} className="kalles-order__item">
                  {image && <img src={image} alt={item?.product?.name} />}
                  <div>
                    <h4>{item?.product?.name}</h4>
                    <p>{t('orderConfirmed.quantity')} {item?.quantity}</p>
                    <p>{t('orderConfirmed.price')}: {formatDisplayPrice(item?.product?.price)}</p>
                    {variant?.color && <p>{t('orderConfirmed.color')}: {variant.color}</p>}
                    {variant?.variantName && <p>{t('orderConfirmed.version')}: {variant.variantName}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {order?.address && (
          <div className="kalles-order__address">
            <h3>{t('orderConfirmed.deliveryAddress')}</h3>
            <p>{order.address.name}</p>
            <p>{order.address.phoneNumber}</p>
            <p>{order.address.street}</p>
            <p>{order.address.wardName}, {order.address.provinceName}</p>
          </div>
        )}

        <div className="kalles-order__actions">
          <Link
            to="/products"
            className="kalles-shop__btn kalles-shop__btn--primary"
            style={{ width: 'auto' }}
          >
            {t('orderConfirmed.continueShopping')}
          </Link>
          <Link
            to="/account-details/orders"
            className="kalles-shop__btn kalles-shop__btn--outline"
            style={{ width: 'auto' }}
          >
            {t('orderConfirmed.viewMyOrders')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;
