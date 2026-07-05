// src/pages/payment/PaymentPage.jsx
import { Elements } from '@stripe/react-stripe-js';
import React, { useEffect, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutPayment';
import { useSelector } from 'react-redux';
import { selectCartItems } from '@app/store/slices/cart.jsx';
import { placeOrderAPI } from '@services/order.service';
import { createOrderRequest } from '@shared/utils/order-util';
import { env } from '@core/config/env';
import { useTranslation } from '@shared/i18n/useTranslation.js';

const stripePublicKey = env.stripePublicKey;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const PaymentPage = ({ userId, addressId }) => {
  const { t } = useTranslation();
  const cartItems = useSelector(selectCartItems);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [initError, setInitError] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);

  const initPayment = useCallback(async () => {
    if (!stripePublicKey) {
      setInitError(t('payment.stripeNotConfigured'));
      return;
    }
    try {
      setIsPreparing(true);
      setInitError('');
      const orderRequest = createOrderRequest(cartItems, userId, addressId);
      const res = await placeOrderAPI(orderRequest);
      setClientSecret(res.credentials.client_secret);
      setOrderId(res.orderId);
    } catch (error) {
      console.error(t('payment.creatingOrder'), error);
      setInitError(t('payment.initFailed'));
    } finally {
      setIsPreparing(false);
    }
  }, [cartItems, userId, addressId, t]);

  useEffect(() => {
    if (!userId || !addressId || !cartItems?.length || !stripePublicKey) return;
    initPayment();
  }, [cartItems, userId, addressId, initPayment]);

  if (!stripePromise) {
    return <p>{t('payment.stripeNotConfigured')}</p>;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'flat',
    },
  };

  return (
   <div>
    {initError && (
      <div className="mb-3 text-sm text-red-600">
        <p>{initError}</p>
        <button
          type="button"
          onClick={initPayment}
          className="mt-2 px-3 py-2 rounded border border-gray-300"
          disabled={isPreparing}
        >
          {t('payment.tryAgain')}
        </button>
      </div>
    )}
    {clientSecret ? (
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
      </Elements>
    ) : (
      <p>{isPreparing ? t('payment.processing') : t('payment.preparing')}</p>
    )}
  </div>
  );
};

export default PaymentPage;
