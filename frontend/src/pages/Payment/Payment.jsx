// src/pages/payment/PaymentPage.jsx
import { Elements } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutPayment';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../../store/features/cart';
import { placeOrderAPI } from '../../api/order.js';
import { createOrderRequest } from '../../utils/order-util';

const stripePromise = loadStripe("pk_test_51RitF8QTOMW9o79JqpIR8NPiGFw8tzoXaQKiCy9MISFfXPz0WmBA7vf3TrcZpFktqRVR5Mv9o5VGaHFzKbe47kIh0081EiTXiq");

const PaymentPage = ({ userId, addressId }) => {
  const cartItems = useSelector(selectCartItems);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const orderRequest = createOrderRequest(cartItems, userId, addressId);
        const res = await placeOrderAPI(orderRequest);
        setClientSecret(res.credentials.client_secret);
        setOrderId(res.orderId);
      } catch (error) {
        console.error(" Lỗi khi tạo đơn hàng:", error);
      }
    };

    initPayment();
  }, [cartItems, userId, addressId]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'flat',
    },
  };

  return (
   <div>
    {clientSecret ? (
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
      </Elements>
    ) : (
      <p>Đang xử lý thanh toán...</p>
    )}
  </div>
  );
};

export default PaymentPage;
