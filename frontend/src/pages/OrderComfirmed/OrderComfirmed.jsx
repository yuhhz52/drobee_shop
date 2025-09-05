import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchOrderAPI } from '../../api/userInfo.js';
import { useSelector, useDispatch } from 'react-redux';
import { deleteCart } from '../../store/features/cart'; 
import Spinner from '../../components/Spinner/Spinner.jsx';
import { formatDisplayPrice } from '../../utils/price-format';

const OrderConfirmed = () => {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const isLoading = useSelector((state) => state.commonState.loading);
  const dispatch = useDispatch();

  const { orderId, amount, status } = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return {
      orderId: query.get('orderId'),
      amount: query.get('amount'),
      status: query.get('status'),
    };
  }, [location.search]);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderAPI()
      .then((orders) => {
        const found = orders.find((o) => String(o.id) === String(orderId));
        if (found) {
          setOrder(found);
          dispatch(deleteCart()); 
        } else {
          setError('Không tìm thấy đơn hàng.');
        }
      })
      .catch(() => setError('Lỗi khi lấy thông tin đơn hàng.'));
  }, [orderId, dispatch]);

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header success */}
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
        <svg className="w-6 h-6 mt-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <div>
          <h1 className="text-lg font-semibold">Đặt hàng thành công!</h1>
          <p className="text-sm">Mã đơn hàng: <strong className="text-black">{order?.orderDisplayCode || order?.id}</strong></p>
        </div>
      </div>

      {/* Order status */}
      <div className="space-y-2 mb-4 text-sm text-gray-700">
        <p>Ngày đặt: {order?.orderDate && new Date(order.orderDate).toLocaleString()}</p>
        {status === 'success' && (
          <p><span className="text-green-600 font-semibold">Thanh toán thành công!</span> Cảm ơn bạn đã mua hàng.</p>
        )}
        {status === 'fail' && order?.paymentMethod === 'VNPAY' && (
          <p><span>Thanh toán qua VNPay <span className="text-red-600 font-semibold">thất bại</span>. Vui lòng thử lại.</span></p>
        )}
        {status === 'fail' && order?.paymentMethod !== 'VNPAY' && (
          <p><span className="text-red-600 font-semibold">Thanh toán thất bại!</span> Vui lòng thử lại.</p>
        )}
        {order?.paymentMethod?.startsWith('pm_') && status === 'success' && (
          <p>Bạn đã thanh toán: <strong className="text-green-600">{formatDisplayPrice(order?.totalAmount)}</strong></p>
        )}
        {order?.paymentMethod === 'COD' && (
          <p>Số tiền bạn thanh toán khi nhận hàng: <strong className="text-green-600">{formatDisplayPrice(order?.totalAmount)}</strong></p>
        )}
        {order?.paymentMethod === 'VNPAY' && status === 'success' && (
          <p>Thanh toán qua VNPay: <strong className="text-green-600">{formatDisplayPrice(order?.totalAmount)}</strong></p>
        )}
      </div>

      {/* Order detail */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-lg space-y-4">
        <h2 className="text-lg font-medium text-gray-800">Thông tin đơn hàng</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Mã đơn hàng: {order?.orderDisplayCode || order?.id}</p>
          <p>• Tổng tiền: {formatDisplayPrice(order?.totalAmount)}</p>
          <p>• Phí vận chuyển: Miễn phí</p>
          <p>• Trạng thái: {order?.orderStatus}</p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-gray-800">Sản phẩm đã đặt</h3>
          <div className="space-y-3">
            {order?.orderItemList?.map((item, idx) => {
              const selectedVariant = item?.product?.variants?.find(
                v => String(v.id) === String(item.productVariantId)
              );

              return (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-md border border-gray-100">
                  <img src={item?.product?.productResources?.[0]?.url} alt={item?.product?.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item?.product?.name}</p>
                    <p className="text-sm text-gray-600">Số lượng: {item?.quantity}</p>
                    <p className="text-sm text-gray-600">Giá: {formatDisplayPrice(item?.product?.price)}</p>
                    {selectedVariant && (
                      <div className="text-sm text-gray-600 space-y-1">
                        {selectedVariant.color && <p>Màu sắc: {selectedVariant.color}</p>}
                        {selectedVariant.size && <p>Kích cỡ: {selectedVariant.size}</p>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {order?.address && (
          <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-1">Địa chỉ giao hàng</h3>
            <p className="text-sm text-gray-700">{order.address.name}</p>
            <p className="text-sm text-gray-700">{order.address.street}</p>
            <p className="text-sm text-gray-700">{order.address.city}, {order.address.state} {order.address.zipCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmed;
