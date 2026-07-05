import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setLoading } from '@app/store/slices/common.jsx';
import { fetchOrderByIdAPI, cancelOrderAPI } from '@services/user.service';
import moment from 'moment';
import { getStepCount } from '@shared/utils/order-util';
import Timeline from '@shared/components/TimeLine/Timelines.jsx';
import { formatDisplayPrice } from '@shared/utils/price-format';
import { useTranslation } from '@shared/i18n/useTranslation.js';

const OrderDetail = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(() => {
    dispatch(setLoading(true));
    fetchOrderByIdAPI(orderId)
      .then(res => {
        setOrder(res);
        setError(null);
      })
      .catch(err => {
        console.error('Fetch order failed', err);
        setError(err?.response?.data?.message || 'Failed to load order');
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const onCancelOrder = useCallback((id) => {
    if (!window.confirm(t('account.cancelConfirm'))) return;
    dispatch(setLoading(true));
    cancelOrderAPI(id)
      .then(() => {
        alert(t('account.cancelSuccess'));
        fetchOrder(); // Refresh order data
      })
      .catch((err) => {
        console.error('Cancel order failed', err);
        const errorMsg = err?.response?.data?.message || err?.message || t('account.cancelFailed');
        alert(errorMsg);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch, fetchOrder, t]);

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">{t('account.loadFailed')}</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/account-details/orders"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {t('account.backToOrders')}
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  const displayOrder = {
    id: order?.id,
    orderDisplayCode: order?.orderDisplayCode,
    orderDate: order?.orderDate,
    orderStatus: order?.orderStatus,
    items: order?.orderItemList?.map(orderItem => ({
      id: orderItem?.id,
      name: orderItem?.product?.name,
      price: orderItem?.itemPrice,
      quantity: orderItem?.quantity,
      url: orderItem?.product?.productResources?.[0]?.url,
      slug: orderItem?.product?.slug,
    })),
    address: order?.address,
    totalAmount: order?.totalAmount,
    discount: order?.discount,
    paymentMethod: order?.paymentMethod,
  };

  const canCancel = order?.orderStatus !== 'CANCELLED' &&
    order?.orderStatus !== 'IN_PROGRESS' &&
    order?.orderStatus !== 'SHIPPED' &&
    order?.orderStatus !== 'DELIVERED';

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/account-details/orders')}
          className="text-gray-600 hover:text-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">{t('account.orderDetails')}</h1>
          <p className="text-gray-500">
            {t('account.orderId')}: <span className="font-semibold text-blue-700">#{displayOrder.orderDisplayCode || displayOrder.id}</span>
          </p>
        </div>
      </div>

      {/* Order Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">
              {t('account.orderDate')}: {moment(displayOrder?.orderDate).format('DD/MM/YYYY HH:mm')}
            </p>
            <p className="text-sm text-gray-500">
              {t('account.paymentMethod')}: <span className="font-medium">{displayOrder.paymentMethod}</span>
            </p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${
              displayOrder.orderStatus === 'CANCELLED'
                ? 'text-red-600'
                : displayOrder.orderStatus === 'DELIVERED'
                  ? 'text-green-600'
                  : 'text-yellow-600'
            }`}>
              {t(`account.status.${displayOrder.orderStatus}`, displayOrder.orderStatus)}
            </p>
          </div>
        </div>

        {/* Timeline */}
        {displayOrder.orderStatus !== 'CANCELLED' && (
          <div className="mb-4">
            <Timeline stepCount={getStepCount[displayOrder?.orderStatus]} />
          </div>
        )}
      </div>

      {/* Products */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('account.products')}</h2>
        <div className="space-y-4">
          {displayOrder.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
              <img
                src={item.url}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="flex-1">
                <Link
                  to={`/product/${item.slug}`}
                  className="font-medium text-gray-800 hover:text-blue-600"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500">{t('account.orderItem.quantity')} {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatDisplayPrice(item.price)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">{t('account.subtotal')}</span>
            <span>{formatDisplayPrice(displayOrder.totalAmount + (displayOrder.discount || 0))}</span>
          </div>
          {displayOrder.discount > 0 && (
            <div className="flex justify-between text-sm mb-2 text-green-600">
              <span>{t('account.discount')}</span>
              <span>-{formatDisplayPrice(displayOrder.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>{t('account.total')}</span>
            <span>{formatDisplayPrice(displayOrder.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('account.shippingAddress')}</h2>
        <div className="text-gray-700">
          <p className="font-medium">{displayOrder.address?.name}</p>
          <p>{displayOrder.address?.phoneNumber}</p>
          <p>{displayOrder.address?.street}</p>
          <p>{displayOrder.address?.wardName}, {displayOrder.address?.districtName}</p>
          <p>{displayOrder.address?.provinceName}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/account-details/orders')}
          className="text-blue-600 hover:text-blue-700"
        >
          {t('account.backToOrders')}
        </button>

        {canCancel && (
          <button
            onClick={() => onCancelOrder(displayOrder.id)}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            {t('account.cancelOrder')}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
