import React, { useEffect, useState, useCallback } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Link, useSearchParams } from 'react-router-dom';
import CheckoutForm from '@features/payment/pages/Payment/CheckoutPayment';
import { env } from '@core/config/env';
import { useTranslation } from '@shared/i18n/useTranslation.js';

const stripePublicKey = env.stripePublicKey;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const PENDING_KEY = 'stripePendingOrder';

/**
 * Stripe payment confirmation page.
 *
 * <p>Reads the pending order (id + Stripe client_secret) that the checkout
 * page stashed in sessionStorage, renders Stripe Elements, and on payment
 * success navigates to the OrderConfirmed page.
 *
 * <p>If no pending order is found (e.g. direct URL access, refresh after
 * expiry) the user is bounced back to /cart-items — we never create a
 * new order from this page.
 */
const StripePaymentPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [pending, setPending] = useState(null);
  const [initError, setInitError] = useState('');

  const readPending = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.clientSecret || !parsed?.orderId) return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const data = readPending();
    if (!data) {
      setInitError(t('checkout.noPendingPayment'));
      return;
    }
    setPending(data);
    // Optional: also verify the orderId query param matches.
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId && urlOrderId !== data.orderId) {
      // stale session — ignore, the data we have is authoritative
    }
  }, [readPending, searchParams, t]);

  if (!stripePromise) {
    return (
      <div className="kalles-shop__container" style={{ padding: '4rem', textAlign: 'center' }}>
        <p>{t('checkout.stripeNotConfigured')}</p>
        <Link to="/cart-items" className="kalles-shop__btn kalles-shop__btn--primary">
          {t('checkout.backToCart')}
        </Link>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="kalles-shop__container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>{t('checkout.paymentSetupExpired')}</h2>
        <p style={{ marginBottom: '1.5rem' }}>{initError}</p>
        <Link to="/cart-items" className="kalles-shop__btn kalles-shop__btn--primary">
          {t('checkout.backToCart')}
        </Link>
      </div>
    );
  }

  if (!pending) {
    return null;
  }

  return (
    <div className="kalles-shop__container" style={{ padding: '2rem 0', maxWidth: 720 }}>
      <h1 className="kalles-shop__title">{t('checkout.completePayment')}</h1>
      <p>{t('checkout.orderIdLabel')} <strong>{pending.orderId}</strong></p>
      <Elements stripe={stripePromise} options={{ clientSecret: pending.clientSecret, appearance: { theme: 'flat' } }}>
        <CheckoutForm clientSecret={pending.clientSecret} orderId={pending.orderId} />
      </Elements>
    </div>
  );
};

export default StripePaymentPage;