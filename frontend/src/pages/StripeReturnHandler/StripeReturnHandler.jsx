import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { confirmPaymentAPI } from '../../api/order.js';
import { selectCartItems } from '../../store/features/cart.jsx';
import { clearCart } from '../../store/actions/cartAction.js';
import { setLoading } from '../../store/features/common.jsx';

const StripeReturnHandler = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('');
  const isLoading = useSelector((state) => state?.commonState?.loading);
  const cartItems = useSelector(selectCartItems);
  const cartItemsRef = useRef(cartItems);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

 useEffect(() => {
  const query = new URLSearchParams(location.search);
  const clientSecret = query.get('payment_intent_client_secret');
  const redirectStatus = query.get('redirect_status');
  const paymentIntentId = query.get('payment_intent');

  if (!paymentIntentId || !redirectStatus) {
    setErrorMessage('Thiếu thông tin thanh toán từ Stripe.');
    return;
  }

  if (redirectStatus === 'succeeded' && !hasProcessedRef.current) {
    hasProcessedRef.current = true;
    dispatch(setLoading(true));

    confirmPaymentAPI({
      paymentIntentId,
      status: redirectStatus
    })
      .then((res) => {
        const orderId = res?.orderId;
        const amount = res?.amount;

        dispatch(clearCart());
        navigate(`/orderConfirmed?orderId=${orderId}&amount=${amount}&status=success`);
      })
      .catch((err) => {
        setErrorMessage('Có lỗi xảy ra khi xác nhận thanh toán.');
        console.error(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  } else if (redirectStatus !== 'succeeded') {
    setErrorMessage('Thanh toán thất bại - ' + redirectStatus);
  }
}, [dispatch, location.search, navigate]);


  return (
    <div className="p-8 text-center">
      <h1 className="text-lg font-medium mb-2">Xử lý thanh toán...</h1>
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      {isLoading && <Spinner />}
    </div>
  );
};

export default StripeReturnHandler;
