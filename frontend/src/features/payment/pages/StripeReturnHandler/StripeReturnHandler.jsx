import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '@shared/components/Spinner/Spinner.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { confirmPaymentAPI } from '@services/order.service';
import { setLoading } from '@app/store/slices/common.jsx';
import { clearDirectCheckoutItem } from '@shared/utils/direct-checkout';
import { useTranslation } from '@shared/i18n/useTranslation.js';

const StripeReturnHandler = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const isLoading = useSelector((state) => state?.commonState?.loading);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get('redirect_status');
    const paymentIntentId = params.get('payment_intent');

    if (!paymentIntentId || !redirectStatus) {
      setErrorMessage(t('payment.missingInfo'));
      return;
    }

    if (redirectStatus !== 'succeeded') {
      setErrorMessage(t('payment.failedStatus', { status: redirectStatus }));
      return;
    }

    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    dispatch(setLoading(true));
    setStatusMessage(t('payment.confirming'));

    const maxAttempts = 3;
    const attemptConfirm = async (attempt = 1) => {
      try {
        const res = await confirmPaymentAPI({ paymentIntentId, status: redirectStatus });
        const orderId = res?.orderId;
        const amount = res?.amount;
        if (!orderId) {
          throw new Error('Missing orderId from payment confirmation');
        }
        // Cart cleanup (for cart checkouts) was performed server-side when
        // the order was originally created. Buy Now never touched the cart.
        // The only client-side cleanup we need is the Buy Now sessionStorage
        // payload, which OrderConfirmedPage will also clear on render.
        clearDirectCheckoutItem();
        sessionStorage.removeItem('stripePendingOrder');
        dispatch(setLoading(false));
        navigate(`/order-confirmed/${orderId}${amount ? `?amount=${amount}&status=success` : '?status=success'}`);
      } catch (err) {
        console.error(`confirmPayment attempt ${attempt} failed`, err);
        if (attempt < maxAttempts) {
          setStatusMessage(t('payment.confirmationRetrying', { next: attempt + 1, total: maxAttempts }));
          const delay = 500 * Math.pow(2, attempt - 1);
          setTimeout(() => attemptConfirm(attempt + 1), delay);
        } else {
          dispatch(setLoading(false));
          setErrorMessage(t('payment.confirmationFailed'));
        }
      }
    };

    attemptConfirm();
  }, [dispatch, navigate, t]);

  return (
    <div className="p-8 text-center">
      <h1 className="text-lg font-medium mb-2">{t('payment.processing')}</h1>
      {statusMessage && <p className="text-gray-600">{statusMessage}</p>}
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      {isLoading && <Spinner />}
      {errorMessage && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/account-details/orders')}
            className="px-4 py-2 rounded border border-gray-300"
          >
            {t('payment.viewOrders')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/cart-items')}
            className="px-4 py-2 rounded bg-black text-white"
          >
            {t('payment.backToCart')}
          </button>
        </div>
      )}
    </div>
  );
};

export default StripeReturnHandler;
