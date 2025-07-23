import React, { use, useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { confirmPaymentAPI } from '../../api/order.js';
import { selectCartItems } from '../../store/features/cart';
import { clearCart } from '../../store/actions/cartAction';

const ConfirmPayment = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [errorMessage,setErrorMessage] = useState('');
    const isLoading = useSelector((state)=> state?.commonState?.loading);
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);
    const cartItemsRef = useRef(cartItems);
    const hasProcessedRef = useRef(false);

    useEffect(()=>{
        // Cập nhật ref khi cartItems thay đổi
        cartItemsRef.current = cartItems;
    }, [cartItems]);

    useEffect(()=>{

        const query = new URLSearchParams(location.search);
        const clientSecret = query.get('payment_intent_client_secret');
        const redirectStatus = query.get('redirect_status');
        const paymentIntent = query.get('payment_intent');


        if(redirectStatus ==='succeeded' && !hasProcessedRef.current){
            hasProcessedRef.current = true;
            // Lưu cart items hiện tại trước khi xử lý
            const currentCartItems = [...cartItemsRef.current];
            confirmPaymentAPI({
                paymentIntent: paymentIntent,
                status:paymentIntent
            }).then(res=>{
                const orderId = res?.orderId;
                console.log('orderId:', orderId);
                // Tính tổng tiền từ cart items đã lưu
                const totalAmount = currentCartItems.reduce((total, item) => {
                    return total + (item?.subTotal || 0);
                }, 0).toFixed(2);
                // Clear cart sau khi thanh toán thành công
                dispatch(clearCart());
                navigate(`/orderConfirmed?orderId=${orderId}&amount=${totalAmount}`)
            }).catch(err=>{
                setErrorMessage("Something went wrong!");
            }).finally(()=>{
                dispatch(setLoading(false));
            })
        
        }else if(redirectStatus !== 'succeeded'){
            setErrorMessage('Payment Failed - '+redirectStatus)
        }

    },[dispatch, location.search, navigate]) // Loại bỏ cartItems khỏi dependency array


  return (
    <>
    <div>Processing Payment...</div>
    {isLoading && <Spinner />}
    </>
  )
}

export default ConfirmPayment