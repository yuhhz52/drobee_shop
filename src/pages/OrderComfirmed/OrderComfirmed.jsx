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
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Đặt hàng thành công!</h1>
      <p className="mb-2">Cảm ơn bạn đã mua hàng tại Shopecom.</p>
      <p className="mb-2">Mã đơn hàng của bạn là: <strong>{order?.id}</strong></p>
      <p className="mb-2">Ngày đặt: {order?.orderDate && new Date(order.orderDate).toLocaleString()}</p>
      
      {/* Hiển thị thông báo dựa trên status từ backend */}
      {status === 'success' && (
        <p className="mb-2">
          <span className="text-green-600 font-semibold">Thanh toán thành công!</span> Cảm ơn bạn đã mua hàng.
        </p>
      )}
      {/* Chỉ hiển thị 1 thông báo thất bại phù hợp phương thức thanh toán */}
      {status === 'fail' && order?.paymentMethod === 'VNPAY' && (
        <p className="mb-2">
          <span>Thanh toán qua VNPay <span className="text-red-600 font-semibold">thất bại</span>. Vui lòng thử lại.</span>
        </p>
      )}
      {status === 'fail' && order?.paymentMethod !== 'VNPAY' && (
        <p className="mb-2">
          <span className="text-red-600 font-semibold">Thanh toán thất bại!</span> Vui lòng thử lại.
        </p>
      )}
      {/* Hiển thị thông tin thanh toán dựa trên paymentMethod */}
      {order?.paymentMethod?.startsWith('pm_') && status === 'success' && (
        <p className="mb-2">
          Bạn đã <span className="text-green-600 font-semibold">thanh toán thành công</span> số tiền: <strong className="text-green-600">{formatDisplayPrice(order?.totalAmount)}</strong>
        </p>
      )}
      {order?.paymentMethod === 'COD' && status === 'success' && (
        <p className="mb-2">
          Số tiền bạn thanh toán khi nhận hàng là: <strong className="text-green-600">{formatDisplayPrice(order?.totalAmount)}</strong>
        </p>
      )}
      {order?.paymentMethod === 'VNPAY' && status === 'success' && (
        <p className="mb-2">
          <span>Bạn đã <span className="text-green-600 font-semibold">thanh toán thành công</span> qua VNPay số tiền: <strong className="text-green-600">{formatDisplayPrice(order?.totalAmount)}</strong></span>
        </p>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Thông tin đơn hàng:</h2>
        <p className="text-sm text-gray-600">• Mã đơn hàng: {order?.id}</p>
        <p className="text-sm text-gray-600">• Tổng tiền: {formatDisplayPrice(order?.totalAmount)}</p>
        <p className="text-sm text-gray-600">• Phí vận chuyển: FREE</p>
        <p className="text-sm text-gray-600">• Trạng thái: {order?.orderStatus}</p>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Sản phẩm:</h3>
          {order?.orderItemList?.map((item, idx) => {
            // Tìm variant đã chọn dựa vào productVariantId
            const selectedVariant = item?.product?.variants?.find(
              v => String(v.id) === String(item.productVariantId)
            );

            return (
              <div key={idx} className="flex items-center gap-4 mb-2">
                <img src={item?.product?.productResources?.[0]?.url} alt={item?.product?.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <p className="font-medium">{item?.product?.name}</p>
                  <p className="text-sm text-gray-600">Số lượng: {item?.quantity}</p>
                  <p className="text-sm text-gray-600">Giá: {formatDisplayPrice(item?.product?.price)}</p>
                  {/* Hiển thị color/size từ variant đã chọn, luôn hiển thị nếu có thuộc tính */}
                  {selectedVariant && (
                    <>
                      {typeof selectedVariant.color !== 'undefined' && (
                        <p className="text-sm text-gray-600">Màu sắc: {selectedVariant.color || 'Không xác định'}</p>
                      )}
                      {typeof selectedVariant.size !== 'undefined' && (
                        <p className="text-sm text-gray-600">Kích cỡ: {selectedVariant.size || 'Không xác định'}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {order?.address && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Địa chỉ giao hàng:</h3>
            <p className="text-sm text-gray-600">{order.address.name}</p>
            <p className="text-sm text-gray-600">{order.address.street}</p>
            <p className="text-sm text-gray-600">{order.address.city}, {order.address.state} {order.address.zipCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmed;
