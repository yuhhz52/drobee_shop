import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems } from '../../store/features/cart';
import { fetchUserDetails } from '../../api/userInfo.js';
import { setLoading } from '../../store/features/common';
import { Navigate, useNavigate } from 'react-router-dom';
import Payment from '../Payment/Payment';
import { placeOrderAPI } from '../../api/order.js';
import { createOrderRequest } from '../../utils/order-util';
import { formatDisplayPrice } from '../../utils/price-format';
import AddAddress from '../Account/AddAddress.jsx';

const Checkout = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('');
  const subTotal = useMemo(() => {
    let value = 0;
    cartItems?.forEach(element => {
      value += element?.subTotal
    });
    return value?.toFixed(2);
  }, [cartItems]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  // Sau khi fetch xong mới gán địa chỉ mặc định
  useEffect(() => {
    dispatch(setLoading(true));
    fetchUserDetails()
      .then((res) => {
        setUserInfo(res);
        if (res?.addressList?.length > 0) {
          setSelectedAddressId(res.addressList[0].id);
        }
      })
      .catch(err => {
        console.error('Failed to fetch user info:', err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch]);

  const handleCODPayment = async () => {
    try {
      dispatch(setLoading(true));
      const orderRequest = createOrderRequest(cartItems, userInfo?.id, selectedAddressId);
      console.log("📦 Sending order request:", orderRequest);
      orderRequest.paymentMethod = 'COD';
      const res = await placeOrderAPI(orderRequest);
      const orderId = res?.orderId;
      navigate(`/orderConfirmed?orderId=${orderId}`);
    } catch (err) {
      alert('Đặt hàng thất bại!');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleVNPayPayment = async () => {
    try {
      dispatch(setLoading(true));
      const orderRequest = createOrderRequest(cartItems, userInfo?.id, selectedAddressId);
      orderRequest.paymentMethod = 'VNPAY';
      console.log('Creating VNPay order:', orderRequest);
      // Gọi API backend để lấy link thanh toán VNPay
      const res = await placeOrderAPI(orderRequest);
      console.log('VNPay order response:', res);

      // Lấy link thanh toán từ đúng trường credentials.paymentUrl
      const paymentUrl = res?.credentials?.paymentUrl;
      if (paymentUrl) {
        console.log('Redirecting to VNPay:', paymentUrl);
        window.location.href = paymentUrl; // Redirect sang VNPay
      } else {
        console.error('No payment URL received:', res);
        alert('Không nhận được URL thanh toán từ VNPay! Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('VNPay payment error:', err);
      alert('Thanh toán VNPay thất bại! Lỗi: ' + (err.message || 'Không thể kết nối đến server'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className='p-8 flex px-5 md:px-12 lg:px-15'>
      <div className='w-[65%]'>
        <div className='flex gap-8'>
          {/* Address */}
          <div className="w-full">
            <p className='font-bold mb-2'>Địa chỉ giao hàng</p>
            {userInfo?.addressList?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {userInfo.addressList.map((address) => (
                  <label key={address.id} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="delivery_address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{address.name} - {address.phoneNumber}</p>
                      <p className="text-sm text-gray-700">
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">
                <p>Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ để tiếp tục đặt hàng.</p>
                <div className="mt-4">
                  <AddAddress onCancel={() => {
                    // refetch lại thông tin người dùng sau khi thêm địa chỉ
                    dispatch(setLoading(true));
                    fetchUserDetails()
                      .then((res) => {
                        setUserInfo(res);
                        if (res?.addressList?.length > 0) {
                          setSelectedAddressId(res.addressList[0].id);
                        }
                      })
                      .catch(err => {
                        console.error('Failed to refetch user info:', err);
                      })
                      .finally(() => {
                        dispatch(setLoading(false));
                      });
                  }} />
                </div>
              </div>

            )}
          </div>
        </div>

        <hr className='border-t border-gray-300 my-4' />
        <div className='flex flex-col gap-2'>
          <p className='font-bold'>Phương thức thanh toán</p>
          <div className='mt-4 flex flex-col gap-4'>
            <div className='flex gap-2'>
              <input type='radio' name='payment_mathod' value={'COD'} onChange={() => setPaymentMethod('COD')} />
              <p> Tiền mặt khi giao hàng</p>
            </div>
            <div className='flex gap-2'>
              <input type='radio' name='payment_mathod' value={'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
              <p> Thanh toán qua VNPay</p>
            </div>
            <div className='flex gap-2'>
              <input type='radio' name='payment_mathod' value={'CARD'} onChange={() => setPaymentMethod('CARD')} />
              <p> Thẻ tín dụng Stripe</p>
            </div>
          </div>
        </div>
        {paymentMethod === 'CARD' && <Payment userId={userInfo?.id} addressId={selectedAddressId} />}
        {paymentMethod === 'COD' && (
          <button
            className='w-[150px] items-center h-[48px] bg-black border rounded-lg mt-4 text-white hover:bg-gray-800'
            onClick={handleCODPayment}

          >
            Pay Now
          </button>
        )}
        {paymentMethod === 'VNPAY' && (
          <button
            className='w-[150px] items-center h-[48px] bg-[#0A68FE] border rounded-lg mt-4 text-white hover:bg-blue-800'
            onClick={handleVNPayPayment}


          >
            Thanh toán VNPay
          </button>
        )}
      </div>
      <div className="w-full md:w-[35%] rounded-lg border-gray-300 p-6">
        <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 font-medium">Sản phẩm</th>
              <th className="p-2 font-medium text-right">Tổng phụ</th>
            </tr>
          </thead>
          <tbody>
            {cartItems?.map((item, index) => (
              <tr key={index} >
                <td className="flex items-center gap-3 p-2">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500 text-sm">
                      {item.variant?.color}, {item.variant?.size}
                    </p>
                  </div>
                </td>
                <td className="p-2 text-right font-medium">
                  {formatDisplayPrice(item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 border-t border-gray-300 pt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Tổng tiền đơn hàng</span>
            <span>{formatDisplayPrice(subTotal)}</span>
          </div>
          <hr className='border-t border-gray-300' />
          <div className="flex justify-between ">
            <span className="text-gray-700">Giao hàng</span>
            <span className="text-green-600 font-medium">Miễn phí</span>
          </div>
          <hr className='border-t border-gray-300' />
          <div className="flex justify-between font-semibold text-base pt-2">
            <span>Tổng tiền thanh toán</span>
            <span>{formatDisplayPrice(subTotal)}</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Checkout