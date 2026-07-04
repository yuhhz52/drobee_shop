import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateAddressAPI } from '@services/user.service';
import { saveAddress } from '@app/store/slices/user.jsx';
import { vietnamRegionService } from '@services/vietnam-region.service';
import SearchableSelect from './SearchableSelect';
import './SearchableSelect.css';
import './Profile.css';

const VIETNAM_PHONE_REGEX = /^(0|\+84)[0-9]{9}$/;

const validatePhone = (phone) => {
  if (!phone) return 'Please enter a phone number';
  const cleaned = phone.replace(/\s/g, '');
  if (!VIETNAM_PHONE_REGEX.test(cleaned)) {
    return 'Invalid phone number (e.g. 0912345678 or +84912345678)';
  }
  return '';
};

const EditAddress = ({ address, onCancel, onSaved }) => {
  const dispatch = useDispatch();
  const [values, setValues] = useState({
    name: address?.name || '',
    phoneNumber: address?.phoneNumber || '',
    street: address?.street || '',
    provinceCode: address?.provinceCode || '',
    provinceName: address?.provinceName || '',
    wardCode: address?.wardCode || '',
    wardName: address?.wardName || ''
  });
  const [phoneError, setPhoneError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    vietnamRegionService.fetchProvinces()
      .then(data => {
        setProvinces(data);
        if (values.provinceCode) {
          setLoadingWards(true);
          vietnamRegionService.fetchWards(values.provinceCode)
            .then(w => setWards(w))
            .catch(() => setError('Could not load wards/communes list'))
            .finally(() => setLoadingWards(false));
        }
      })
      .catch(() => setError('Could not load provinces/cities list'))
      .finally(() => setLoadingProvinces(false));
  }, [values.provinceCode]);

  const handleProvinceSelect = useCallback((province) => {
    setValues(prev => ({
      ...prev,
      provinceCode: province.code,
      provinceName: province.name,
      wardCode: '',
      wardName: ''
    }));
    setWards([]);

    if (!province.code) return;
    setLoadingWards(true);
    vietnamRegionService.fetchWards(province.code)
      .then(data => setWards(data))
      .catch(() => setError('Could not load wards/communes list'))
      .finally(() => setLoadingWards(false));
  }, []);

  const handleWardSelect = useCallback((ward) => {
    setValues(prev => ({
      ...prev,
      wardCode: ward.code,
      wardName: ward.name
    }));
  }, []);

  const handleOnChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));

    if (name === 'phoneNumber') {
      setPhoneError(validatePhone(value));
    }
  }, []);

  const onSubmit = useCallback((evt) => {
    evt.preventDefault();
    if (!address?.id) {
      setError('Invalid address');
      return;
    }
    const phoneErr = validatePhone(values.phoneNumber);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }

    setSaving(true);
    setError('');
    updateAddressAPI(address.id, values)
      .then((res) => {
        dispatch(saveAddress(res));
        const afterSave = onSaved || onCancel;
        afterSave && afterSave();
      })
      .catch(() => {
        setError('Could not update address. Please try again.');
      })
      .finally(() => {
        setSaving(false);
      });
  }, [dispatch, onCancel, onSaved, values, address.id]);

  return (
    <div className="address-form-card">
      <h2 className="address-form-card__title">Edit address</h2>

      <form onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input
              type="text"
              name="name"
              value={values.name}
              onChange={handleOnChange}
              placeholder="Enter your full name"
              className="form-input"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Phone number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={values.phoneNumber}
              onChange={handleOnChange}
              onBlur={() => setPhoneError(validatePhone(values.phoneNumber))}
              placeholder="0912345678 or +84912345678"
              className="form-input"
              required
            />
            {phoneError && <span className="form-error">{phoneError}</span>}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Province / City</label>
          <SearchableSelect
            options={provinces}
            value={values.provinceCode}
            displayName={values.provinceName}
            onSelect={handleProvinceSelect}
            placeholder="Search province/city..."
            disabled={loadingProvinces}
            loading={loadingProvinces}
            filterFn={vietnamRegionService.searchProvinces}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Ward / Commune</label>
          <SearchableSelect
            options={wards}
            value={values.wardCode}
            displayName={values.wardName}
            onSelect={handleWardSelect}
            placeholder="Search ward/commune..."
            disabled={!values.provinceCode || loadingWards}
            loading={loadingWards}
            filterFn={vietnamRegionService.searchWards}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Street address</label>
          <input
            type="text"
            name="street"
            value={values.street}
            onChange={handleOnChange}
            placeholder="House number, street, building, floor..."
            className="form-input"
            required
          />
        </div>

        {error && <p className="form-error-message">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn--outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={saving || phoneError}
          >
            {saving ? (
              <>
                <span className="spinner spinner--small"></span>
                Saving...
              </>
            ) : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAddress;
