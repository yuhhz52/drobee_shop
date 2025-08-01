import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems } from '../../store/features/cart';
import { fetchUserDetails } from '../../api/userInfo.js';
import {setLoading} from '../../store/features/common';
import { Navigate, useNavigate } from 'react-router-dom';
import Payment from '../Payment/Payment';
import { placeOrderAPI } from '../../api/order.js';
import { createOrderRequest } from '../../utils/order-util';
import { formatDisplayPrice } from '../../utils/price-format';
const Checkout = () => {
    const cartItems = useSelector(selectCartItems);
    const dispatch = useDispatch();
    const [userInfo, setUserInfo] = useState();
    const navigate = useNavigate();
    const [paymentMethod,setPaymentMethod] = useState('');
    const subTotal = useMemo(()=>{
        let value = 0;
        cartItems?.forEach(element => {
           value += element?.subTotal 
        });
        return value?.toFixed(2);
      },[cartItems]);

      useEffect(()=>{
        dispatch(setLoading(true))
        fetchUserDetails().then(res=>{
            setUserInfo(res);

        }).catch(err=>{

        }).finally(()=>{
        dispatch(setLoading(false))
    })
      },[dispatch])

  const handleCODPayment = async () => {
    try {
      dispatch(setLoading(true));
      const orderRequest = createOrderRequest(cartItems, userInfo?.id, userInfo?.addressList?.[0]?.id);
      orderRequest.paymentMethod = 'COD'; // Đảm bảo đúng phương thức
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
      const orderRequest = createOrderRequest(cartItems, userInfo?.id, userInfo?.addressList?.[0]?.id);
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
    <div className='p-8 flex'>
        <div className='w-[70%]'>
             <div className='flex gap-8'>
          {/* Address */}
          <p className='font-bold'>Delivery address</p>
          {userInfo?.addressList && 
          <div>
            <p>{userInfo?.addressList?.[0]?.name}</p>
            <p>{userInfo?.addressList?.[0]?.street}</p>
            <p>{userInfo?.addressList?.[0]?.city},{userInfo?.addressList?.[0]?.state} {userInfo?.addressList?.[0]?.zipCode}</p>
          </div>} 
        </div>
         <hr className='h-[2px] bg-slate-200 w-[90%] my-4'></hr>   
         <div className='flex gap-8 flex-col'>
          {/* Address */}
          <p className='font-bold'>Choose delivery</p>
          <div>
            <p>Select a day</p>
            <div className='flex gap-4 mt-4'>
                  <div className='w-[80px] h-[48px] flex flex-col justify-center border text-center mb-4 rounded-lg mr-4 cursor-pointer
                   hover:scale-110 bg-gray-200 border-gray-500 text-gray-500'><p className='text-center'>{'Oct 5'}</p></div>

            <div className='w-[80px] h-[48px] flex flex-col justify-center border text-center mb-4 rounded-lg mr-4 cursor-pointer
                   hover:scale-110 bg-white border-gray-500 text-gray-500'><p className='text-center'>{'Oct 8'}</p></div>
                  
                  </div>
          </div>
        </div>
         <hr className='h-[2px] bg-slate-200 w-[90%] my-4'></hr>
         <div className='flex flex-col gap-2'>
          {/* Address */}
          <p className='font-bold'>Payment Method</p>
          <div className='mt-4 flex flex-col gap-4'>
            <div className='flex gap-2'>
            <input type='radio' name='payment_mathod' value={'CARD'} onChange={()=> setPaymentMethod('CARD')}/>
            <p> Thẻ tín dụng Stripe</p>
            </div>
            <div className='flex gap-2'>
            <input type='radio' name='payment_mathod' value={'COD'} onChange={()=> setPaymentMethod('COD')}/>
            <p> Tiền mặt khi giao hàng</p>
            </div>
            <div className='flex gap-2'>
            <input type='radio' name='payment_mathod' value={'VNPAY'} onChange={()=> setPaymentMethod('VNPAY')}/>
            <p> Thanh toán qua VNPay</p>
            </div>

          </div>
        </div>
        {paymentMethod === 'CARD' && <Payment userId={userInfo?.id} addressId={userInfo?.addressList?.[0]?.id}/>}
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
        <div className='w-[30%] border rounded-lg border-gray-500 p-4 flex flex-col gap-4'>
            <p>Oder Summary</p>
            <p>Items Count = {cartItems?.length}</p>
            <p>SubTotal = {formatDisplayPrice(subTotal)}</p>
            <p>Shipping = FREE</p>
            <hr className='h-[2px] bg-gray-400'></hr>
            <p>Total Amount = {formatDisplayPrice(subTotal)}</p>
        </div>     
    </div>
  )
}

export default Checkout