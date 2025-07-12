import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const OrderConfirmed = () => {
  const location = useLocation();

  const { orderId, amount } = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return {
      orderId: query.get('orderId'),
      amount: query.get('amount'),
    };
  }, [location.search]);


  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Thanh toán thành công!</h1>
      <p className="mb-2">Cảm ơn bạn đã mua hàng tại Shopecom.</p>
      <p className="mb-2">Mã đơn hàng của bạn là: <strong>{orderId}</strong></p>
      {amount && (
        <p className="mb-4">Số tiền đã thanh toán: <strong className="text-green-600">${amount}</strong></p>
      )}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Thông tin đơn hàng:</h2>
        <p className="text-sm text-gray-600">• Mã đơn hàng: {orderId}</p>
        {amount && <p className="text-sm text-gray-600">• Tổng tiền: ${amount}</p>}
        <p className="text-sm text-gray-600">• Phí vận chuyển: FREE</p>
        <p className="text-sm text-gray-600">• Trạng thái: Đã thanh toán</p>
      </div>
    </div>
  );
};

export default OrderConfirmed;
