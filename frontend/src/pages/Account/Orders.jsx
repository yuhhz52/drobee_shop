import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../store/features/common';
import { cancelOrderAPI, fetchOrderAPI } from '../../api/userInfo.js';
import { loadOrders, selectAllOrders } from '../../store/features/user';
import moment from 'moment';
import { getStepCount } from '../../utils/order-util';
import Timeline from '../../components/TimeLine/Timelines.jsx';
import { formatDisplayPrice } from '../../utils/price-format';

const Orders = () => {

  const dispatch = useDispatch();
  const allOrders = useSelector(selectAllOrders);
  const [selectedFilter, setSelectedFilter] = useState('ACTIVE');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');

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
    dispatch(setLoading(true));
    fetchOrderAPI().then(res => {
      dispatch(loadOrders(res));
    }).catch(err => {

    }).finally(() => {
      dispatch(setLoading(false));
    })
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
    setSelectedOrder('');
  }, []);

  const onCancelOrder = useCallback((id) => {
    dispatch(setLoading(true));
    cancelOrderAPI(id).then(res => {
      setOrders(prevOrders => prevOrders.map(order =>
        order.id === id ? { ...order, orderStatus: 'CANCELLED', status: 'CANCELLED' } : order
      ));
    }).catch(err => {

    }).finally(() => {
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
                <div className="flex justify-between items-center mb-4">
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
                      className={`text-sm font-semibold ${order.orderStatus === 'CANCELLED'
                          ? 'text-red-600'
                          : order.orderStatus === 'DELIVERED'
                            ? 'text-green-600'
                            : 'text-yellow-600'
                        }`}
                    >
                      {order.orderStatus}
                    </p>
                    <button
                      onClick={() =>
                        setSelectedOrder((prev) => (prev === order.id ? '' : order.id))
                      }
                      className="text-gray-600 text-sm mt-1"
                    >
                      {selectedOrder === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                    </button>

                  </div>
                </div>

                {selectedOrder === order.id && (
                  <>
                    {/* Sản phẩm */}
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 bg-gray-50 rounded-lg p-2"
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div className="text-sm text-gray-700">
                            <p className="font-medium">{item.name}</p>
                            <p>Số lượng: {item.quantity}</p>
                            <p>Giá: {formatDisplayPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Địa chỉ */}
                    <div className="mt-4 text-sm text-gray-600">
                      <p className="font-semibold">Giao đến:</p>
                      <p>
                        {order?.address?.name} - {order?.address?.phoneNumber}
                      </p>
                      <p>
                        {order?.address?.street}, {order?.address?.city},{' '}
                        {order?.address?.state} {order?.address?.zipCode}
                      </p>
                    </div>

                    {/* Tổng tiền + Trạng thái */}
                    <div className="flex justify-between items-center mt-4">
                      <p className="font-bold text-lg">
                        Tổng tiền: {formatDisplayPrice(order?.totalAmount)}
                      </p>

                      {order?.orderStatus !== 'CANCELLED' &&
                        getStepCount[order?.orderStatus] <= 2 && (
                          <button
                            onClick={() => onCancelOrder(order.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            Huỷ đơn
                          </button>
                        )}
                    </div>

                    {/* Timeline tiến trình */}
                    {order?.orderStatus !== 'CANCELLED' && (
                      <div className="mt-4">
                        <Timeline stepCount={getStepCount[order?.orderStatus]} />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>

  )
}

export default Orders
