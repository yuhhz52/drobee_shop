// src/pages/payment/CheckoutPayment.jsx
import React, { useCallback, useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../store/features/common';

const CheckoutForm = ({ clientSecret, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    dispatch(setLoading(true));
    setError('');

    try {
      await elements.submit();

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: 'http://localhost:5175/payment/stripe-success',
        },
      });

      if (error) {
        setError(error.message);
        console.error("Stripe confirm error:", error);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi xác nhận thanh toán.");
    } finally {
      dispatch(setLoading(false));
    }
  }, [stripe, elements, clientSecret, dispatch]);


  return (
    <form onSubmit={handleSubmit} className="p-4 w-[350px]">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe}
        className="w-full mt-4 bg-black text-white h-12 rounded hover:bg-gray-800"
      >
        Thanh toán
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mt-2">Thanh toán thành công!</p>}
    </form>
  );
};

export default CheckoutForm;
