import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../store/features/common';
import { addAddressAPI } from '../../api/userInfo.js';
import { saveAddress } from '../../store/features/user';

const AddAddress = ({ onCancel }) => {
  const [values, setValues] = useState({
    name: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const onSubmit = useCallback((evt) => {
    evt.preventDefault();
    dispatch(setLoading(true));
    setError('');
    addAddressAPI(values)
      .then(res => {
        dispatch(saveAddress(res));
        onCancel && onCancel();
      })
      .catch(() => {
        setError('Không thể thêm địa chỉ. Vui lòng thử lại.');
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch, onCancel, values]);

  const handleOnChange = useCallback((e) => {
    setValues(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thêm địa chỉ</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Họ và tên</label>
          <input
            type="text"
            name="name"
            value={values?.name}
            onChange={handleOnChange}
            placeholder="Nguyễn Văn A"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Số điện thoại</label>
          <input
            type="text"
            name="phoneNumber"
            value={values?.phoneNumber}
            onChange={handleOnChange}
            placeholder="0123456789"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Địa chỉ</label>
          <input
            type="text"
            name="street"
            value={values?.street}
            onChange={handleOnChange}
            placeholder="123 Đường ABC"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="city"
              value={values?.city}
              onChange={handleOnChange}
              placeholder="Thành phố"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <input
              type="text"
              name="state"
              value={values?.state}
              onChange={handleOnChange}
              placeholder="Tỉnh/Thành"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <input
            type="text"
            name="zipCode"
            value={values?.zipCode}
            onChange={handleOnChange}
            placeholder="Mã bưu điện(nếu có)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 rounded-lg px-5 py-2 hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-700 transition"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddress;
