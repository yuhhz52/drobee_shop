import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from '@shared/components/Spinner/Spinner.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { confirmPaymentAPI } from '@services/order.service';
import { clearCart } from '@app/store/actions/cartAction';
import { setLoading } from '@app/store/slices/common.jsx';

const StripeReturnHandler = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const isLoading = useSelector((state) => state?.commonState?.loading);
  const hasProcessedRef = useRef(false);

 useEffect(() => {
  const query = new URLSearchParams(location.search);
  const redirectStatus = query.get('redirect_status');
  const paymentIntentId = query.get('payment_intent');

  if (!paymentIntentId || !redirectStatus) {
    setErrorMessage('Thiếu thông tin thanh toán từ Stripe.');
    return;
  }

    if (redirectStatus === 'succeeded' && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      dispatch(setLoading(true));
      setStatusMessage('Đang xác nhận thanh toán...');

      // Retry logic: attempt confirmPaymentAPI up to 3 times with backoff
      const maxAttempts = 3;
      const attemptConfirm = async (attempt = 1) => {
        try {
          const res = await confirmPaymentAPI({ paymentIntentId, status: redirectStatus });
          const orderId = res?.result?.orderId;
          const amount = res?.result?.amount;
          if (!orderId) {
            throw new Error('Missing orderId from payment confirmation');
          }
          dispatch(clearCart());
          dispatch(setLoading(false));
          navigate(`/orderConfirmed?orderId=${orderId}&amount=${amount}&status=success`);
        } catch (err) {
          console.error(`confirmPayment attempt ${attempt} failed`, err);
          if (attempt < maxAttempts) {
            setStatusMessage(`Xác nhận thất bại. Đang thử lại lần ${attempt + 1}/${maxAttempts}...`);
            // exponential backoff
            const delay = 500 * Math.pow(2, attempt - 1);
            setTimeout(() => attemptConfirm(attempt + 1), delay);
          } else {
            dispatch(setLoading(false));
            setErrorMessage('Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng liên hệ support.');
          }
        }
      };

      attemptConfirm();
    } else if (redirectStatus !== 'succeeded') {
      setErrorMessage('Thanh toán thất bại - ' + redirectStatus);
    }
}, [dispatch, location.search, navigate]);


  return (
    <div className="p-8 text-center">
      <h1 className="text-lg font-medium mb-2">Xử lý thanh toán...</h1>
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
            Xem đơn hàng
          </button>
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="px-4 py-2 rounded bg-black text-white"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default StripeReturnHandler;
