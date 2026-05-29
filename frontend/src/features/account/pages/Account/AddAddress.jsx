import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading } from '@app/store/slices/common.jsx';
import { addAddressAPI } from '@services/user.service';
import { saveAddress } from '@app/store/slices/user.jsx';

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
    <div className="vepace-address-form">
      <h2>Thêm địa chỉ</h2>

      <form onSubmit={onSubmit}>
        <div className="vepace-form-field">
          <label>Họ và tên</label>
          <input
            type="text"
            name="name"
            value={values?.name}
            onChange={handleOnChange}
            placeholder="Nguyễn Văn A"
            required
          />
        </div>

        <div className="vepace-form-field">
          <label>Số điện thoại</label>
          <input
            type="text"
            name="phoneNumber"
            value={values?.phoneNumber}
            onChange={handleOnChange}
            placeholder="0123456789"
            required
          />
        </div>

        <div className="vepace-form-field">
          <label>Địa chỉ</label>
          <input
            type="text"
            name="street"
            value={values?.street}
            onChange={handleOnChange}
            placeholder="123 Đường ABC"
            required
          />
        </div>

        <div className="vepace-form-row">
          <div className="vepace-form-field">
            <input
              type="text"
              name="city"
              value={values?.city}
              onChange={handleOnChange}
              placeholder="Thành phố"
              required
            />
          </div>
          <div className="vepace-form-field">
            <input
              type="text"
              name="state"
              value={values?.state}
              onChange={handleOnChange}
              placeholder="Tỉnh/Thành"
              required
            />
          </div>
        </div>

        <div className="vepace-form-field">
          <input
            type="text"
            name="zipCode"
            value={values?.zipCode}
            onChange={handleOnChange}
            placeholder="Mã bưu điện(nếu có)"
          />
        </div>

        {error && <p className="vepace-form-error">{error}</p>}

        <div className="vepace-form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="vepace-btn vepace-btn--outline"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="vepace-btn vepace-btn--dark"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddress;
