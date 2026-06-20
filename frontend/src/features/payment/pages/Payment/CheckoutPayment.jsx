// src/pages/payment/CheckoutPayment.jsx
import React, { useCallback, useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import { setLoading } from '@app/store/slices/common.jsx';

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
          return_url: `${window.location.origin}/payment/stripe-success`,
        },
      });

      if (error) {
        setError(error.message);
        console.error("Stripe confirm error:", error);
      }
    } catch (err) {
      setError("An error occurred while confirming payment.");
    } finally {
      dispatch(setLoading(false));
    }
  }, [stripe, elements, clientSecret, dispatch]);


  return (
    <form onSubmit={handleSubmit} className="p-4 w-[550px]">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe}
        className="w-full mt-4 bg-black text-white h-12 rounded hover:bg-gray-800"
      >
        Pay now
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mt-2">Payment successful!</p>}
    </form>
  );
};

export default CheckoutForm;
