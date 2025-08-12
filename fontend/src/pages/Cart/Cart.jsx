import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems } from '../../store/features/cart';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { delteItemFromCartAction, updateItemCartAction } from '../../store/actions/cartAction';
import { Link, useNavigate } from 'react-router-dom';
import { customStyles } from '../../styles/modal';
import Modal from 'react-modal';
import { isTokenValid } from '../../utils/jwt-helper';
import EmptyCart from '../../assets/images/empty-cart.png';
import { formatDisplayPrice } from '../../utils/price-format';
import { FaRegTrashCan } from 'react-icons/fa6';

const headers = ['Sản phẩm', 'Giá', 'Số lượng', 'Vận chuyển', 'Tạm tính', 'Xóa'];

const Cart = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState({});
  const navigate = useNavigate();

  const onChangeQuantity = useCallback((value, productId, variantId) => {
    dispatch(
      updateItemCartAction({
        productId: productId,
        variant_id: variantId,
        quantity: value,
      })
    );
  }, [dispatch]);

  const onDeleteProduct = useCallback((productId, variantId) => {
    setModalIsOpen(true);
    setDeleteItem({
      productId: productId,
      variantId: variantId,
    });
  }, []);

  const onCloseModal = useCallback(() => {
    setDeleteItem({});
    setModalIsOpen(false);
  }, []);

  const onDeleteItem = useCallback(() => {
    dispatch(delteItemFromCartAction(deleteItem));
    setModalIsOpen(false);
  }, [deleteItem, dispatch]);

  const subTotal = useMemo(() => {
    let value = 0;
    cartItems?.forEach((element) => {
      value += element?.subTotal;
    });
    return value?.toFixed(2);
  }, [cartItems]);

  const isLoggedIn = useMemo(() => {
    return isTokenValid();
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {cartItems?.length > 0 ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>
          <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
            <table className="w-full text-base">
              <thead className="bg-gray-700 text-white uppercase">
                <tr>
                  {headers.map((header, idx) => (
                    <th key={idx} className="px-6 py-3 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cartItems?.map((item, index) => (
                  <tr
                    key={item.productId + '-' + (item.variant?.id || index)}
                    className=" hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={item?.thumbnail}
                          alt={'product' + index}
                          className="w-[100px] h-[100px] object-cover rounded-md shadow"
                        />
                        <div className="ml-4 text-gray-700">
                          <p className="font-semibold">{item?.name}</p>
                          <p className="text-sm">Size: {item?.variant?.size}</p>
                          <p className="text-sm">Màu: {item?.variant?.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{formatDisplayPrice(item?.price)}</td>
                    <td className="px-6 py-4">
                      <NumberInput quantity={item?.quantity}onChangeQuantity={
                        (value) => onChangeQuantity(value, item?.productId, item?.variant?.id)}onRemoveItem={
                          () => onDeleteProduct(item?.productId, item?.variant?.id)}/>
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium">Miễn phí</td>
                    <td className="px-6 py-4">{formatDisplayPrice(item?.subTotal)}</td>
                    <td className="px-6 py-4">
                      <button
                        className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                        onClick={() => onDeleteProduct(item?.productId, item?.variant?.id)}
                      >
                        <FaRegTrashCan size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between mt-8 gap-6">
            {/* Mã giảm giá */}
            <div className="bg-white p-6 rounded-lg shadow w-full md:w-1/2">
              <h2 className="text-lg font-bold mb-2"> Mã giảm giá</h2>
              <p className="text-sm text-gray-500 mb-4">Nhập mã giảm giá của bạn</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                  placeholder="Nhập mã"
                />
                <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Tổng tiền */}
            <div className="bg-white p-6 rounded-lg shadow w-full md:w-1/2">
              <div className="flex justify-between text-lg mb-2">
                <span>Tạm tính:</span>
                <span>{formatDisplayPrice(subTotal)}</span>
              </div>
              <div className="flex justify-between text-lg mb-2">
                <span>Vận chuyển:</span>
                <span>{formatDisplayPrice(0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Tổng cộng:</span>
                <span>{formatDisplayPrice(subTotal)}</span>
              </div>
              {isLoggedIn && (
                <button
                  className="w-full mt-4 bg-black text-white py-3 rounded-lg text-lg hover:bg-gray-800 transition"
                  onClick={() => navigate('/checkout')}
                >
                  Thanh toán ngay
                </button>
              )}
            </div>
          </div>

          {/* Modal xác nhận xóa */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={onCloseModal}
            style={customStyles}
            contentLabel="Xác nhận xóa"
          >
            <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
            <div className="flex justify-between p-4">
              <button
                className="h-[40px] px-4 border rounded-lg"
                onClick={onCloseModal}
              >
                Hủy bỏ
              </button>
              <button
                className="bg-red-600 text-white px-4 h-[40px] rounded-lg"
                onClick={onDeleteItem}
              >
                Xóa
              </button>
            </div>
          </Modal>
        </>
      ) : (
        <div className="w-full text-center py-12">
          <div className="flex justify-center mb-4">
            <img
              src={EmptyCart}
              className="w-[200px] h-[200px] object-contain"
              alt="empty-cart"
            />
          </div>
          <p className="text-2xl font-bold">Giỏ hàng trống!</p>
          <Link
            to="/men"
            className="inline-block mt-4 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
