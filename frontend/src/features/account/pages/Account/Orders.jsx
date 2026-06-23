import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setLoading } from '@app/store/slices/common.jsx';
import { cancelOrderAPI, fetchOrderAPI } from '@services/user.service';
import { loadOrders, selectAllOrders, cancelOrder as cancelOrderAction } from '@app/store/slices/user.jsx';
import moment from 'moment';
import { formatDisplayPrice } from '@shared/utils/price-format';

const Orders = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allOrders = useSelector(selectAllOrders);
  const [selectedFilter, setSelectedFilter] = useState('ACTIVE');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    dispatch(setLoading(true));
    fetchOrderAPI()
      .then(res => {
        console.log('FETCHED ORDER:', res);
        dispatch(loadOrders(res));
      })
      .catch(err => {
        console.error('Fetch orders failed', err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch]);



  useEffect(() => {
    const displayOrders = allOrders?.map(order => ({
      id: order?.id,
      orderDisplayCode: order?.orderDisplayCode,
      orderDate: order?.orderDate,
      orderStatus: order?.orderStatus,
      status:
        order?.orderStatus === 'PENDING' || order?.orderStatus === 'IN_PROGRESS' || order?.orderStatus === 'SHIPPED'
          ? 'ACTIVE'
          : order?.orderStatus === 'DELIVERED'
            ? 'COMPLETED'
            : order?.orderStatus,
      items: order?.orderItemList?.map(orderItem => ({
        id: orderItem?.id,
        name: orderItem?.product?.name,
        price: orderItem?.product?.price,
        quantity: orderItem?.quantity,
        url: orderItem?.product?.productResources?.[0]?.url,
        slug: orderItem?.product?.slug,
      })),
      address: order?.address,
      totalAmount: order?.totalAmount,
    }));
    setOrders(displayOrders);
  }, [allOrders]);


  const handleOnChange = useCallback((evt) => {
    const value = evt?.target?.value;
    setSelectedFilter(value);
  }, []);

  const onCancelOrder = useCallback((id) => {
    if (!window.confirm('Bạn có chắc muốn huỷ đơn này?')) return;
    dispatch(setLoading(true));
    cancelOrderAPI(id)
      .then(() => {
        // Update both local state and Redux store
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, orderStatus: 'CANCELLED', status: 'CANCELLED' } : order
          )
        );
        dispatch(cancelOrderAction(id));
        alert('Đã huỷ đơn hàng thành công.');
      })
      .catch((err) => {
        console.error('Cancel order failed', err);
        // Show specific error message from backend
        const errorMsg = err?.response?.data?.message || err?.message || 'Huỷ đơn không thành công. Vui lòng thử lại.';
        alert(errorMsg);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch])


  return (
    <div className="p-4">
      {orders.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
            <select
              className="border border-gray-300 rounded px-4 py-2"
              value={selectedFilter}
              onChange={handleOnChange}
            >
              <option value="ACTIVE">Đang xử lý</option>
              <option value="CANCELLED">Đã huỷ</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>

          {orders.map((order) =>
            order?.status === selectedFilter ? (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6 transition hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      Đơn hàng: <span className="text-blue-700 font-bold">#{order.orderDisplayCode || order.id}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Ngày đặt: {moment(order?.orderDate).format('DD/MM/YYYY')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        order.orderStatus === 'CANCELLED'
                          ? 'text-red-600'
                          : order.orderStatus === 'DELIVERED'
                            ? 'text-green-600'
                            : 'text-yellow-600'
                      }`}
                    >
                      {order.orderStatus}
                    </p>
                    <button
                      onClick={() => navigate(`/account-details/orders/${order.id}`)}
                      className="text-blue-600 text-sm mt-1 hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>

                {/* Preview Sản phẩm */}
                <div className="flex items-center gap-4 mt-4 border-t border-gray-100 pt-4">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ))}
                  {order.items?.length > 3 && (
                    <span className="text-gray-500 text-sm">+{order.items.length - 3} sản phẩm</span>
                  )}
                  <div className="ml-auto">
                    <p className="font-bold text-lg">{formatDisplayPrice(order?.totalAmount)}</p>
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>

  )
}

export default Orders
