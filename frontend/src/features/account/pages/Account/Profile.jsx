import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeAddress, selectUserInfo, updateAvatar, saveAddress } from '@app/store/slices/user.jsx';
import AddAddress from './AddAddress';
import EditAddress from './EditAddress';
import { setLoading } from '@app/store/slices/common.jsx';
import { deleteAddressAPI, setDefaultAddressAPI, uploadAvatar } from '@services/user.service';
import { buildUserInitial, resolveAvatarUrl } from '@shared/utils/avatar';
import { preprocessAvatarImage } from '@shared/utils/image';
import './Profile.css';

const MAX_AVATAR_UPLOAD_SIZE = 5 * 1024 * 1024;

const Profile = () => {
  const userInfo = useSelector(selectUserInfo);
  const [addAddress, setAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [avatarError, setAvatarError] = useState('');
  const [settingDefault, setSettingDefault] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const dispatch = useDispatch();

  const onSetDefaultAddress = useCallback((id) => {
    if (!id || settingDefault === id) return;
    dispatch(setLoading(true));
    setSettingDefault(id);
    setDefaultAddressAPI(id).then(res => {
      dispatch(saveAddress(res));
    }).catch(err => {

    }).finally(() => {
      dispatch(setLoading(false));
      setSettingDefault(null);
    })
  }, [dispatch, settingDefault]);

  const onDeleteAddress = useCallback((id) => {
    if (!id) return;
    dispatch(setLoading(true));
    setDeletingId(id);
    deleteAddressAPI(id).then(res => {
      dispatch(removeAddress(id));
      setShowDeleteConfirm(null);
    }).catch(err => {

    }).finally(() => {
      dispatch(setLoading(false));
      setDeletingId(null);
    })
  }, [dispatch]);

  const onUploadAvatar = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarError('');

    if (!file.type?.startsWith('image/')) {
      setAvatarError('Please select a valid image file.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_UPLOAD_SIZE) {
      setAvatarError('Image is too large. Please select an image smaller than 5MB.');
      event.target.value = '';
      return;
    }

    dispatch(setLoading(true));
    preprocessAvatarImage(file, { targetSize: 512, mimeType: 'image/jpeg', quality: 0.88 })
      .then((processedFile) => uploadAvatar(processedFile))
      .then((res) => {
        dispatch(updateAvatar(res?.avatarUrl || ''));
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Could not update avatar. Please try again.';
        setAvatarError(message);
      })
      .finally(() => {
        dispatch(setLoading(false));
        event.target.value = '';
      });
  }, [dispatch]);

  const avatarUrl = resolveAvatarUrl(userInfo?.avatarUrl);

  const fullName = [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(' ') || 'Not updated yet';

  return (
    <div className="profile-page">
      <h1 className="page-title">My account</h1>

      {!addAddress && !editingAddress && (
        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-card__avatar-section">
              <div className="profile-avatar-wrapper">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar profile-avatar--placeholder">
                    {buildUserInitial(userInfo)}
                  </div>
                )}
                <label className="profile-avatar__edit-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onUploadAvatar}
                    className="hidden-input"
                  />
                </label>
              </div>
              {avatarError && <p className="profile-avatar-error">{avatarError}</p>}
            </div>

            <div className="profile-card__info">
              <h2 className="profile-card__name">{fullName}</h2>
              <div className="profile-info-list">
                <div className="profile-info-item">
                  <span className="profile-info-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                    </svg>
                    Phone number
                  </span>
                  <span className="profile-info-value">{userInfo?.phoneNumber || 'Not updated yet'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email
                  </span>
                  <span className="profile-info-value">{userInfo?.email || 'Not updated yet'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="addresses-section">
            <div className="addresses-header">
              <h3 className="addresses-title">Shipping addresses</h3>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setAddAddress(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add new address
              </button>
            </div>

            {userInfo?.addressList?.length ? (
              <div className="addresses-grid">
                {userInfo?.addressList?.map((address) => (
                  <div
                    key={address.id}
                    className={`address-card ${address.isDefault ? 'address-card--default' : ''}`}
                  >
                    {address.isDefault && (
                      <div className="address-card__badge">Default</div>
                    )}
                    <div className="address-card__body">
                      <div className="address-card__contact">
                        <span className="address-card__name">{address?.name}</span>
                        <span className="address-card__phone">{address?.phoneNumber}</span>
                      </div>
                      <p className="address-card__street">{address?.street}</p>
                      <p className="address-card__location">
                        {address?.wardName}, {address?.provinceName}
                      </p>
                    </div>
                    <div className="address-card__actions">
                      {!address.isDefault && (
                        <button
                          type="button"
                          className="address-card__btn address-card__btn--set-default"
                          onClick={() => onSetDefaultAddress(address?.id)}
                          disabled={settingDefault === address?.id}
                        >
                          {settingDefault === address?.id ? (
                            <>
                              <span className="spinner spinner--small"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Set as default
                            </>
                          )}
                        </button>
                      )}
                      <div className="address-card__edit-delete">
                        <button
                          type="button"
                          className="address-card__btn address-card__btn--edit"
                          onClick={() => setEditingAddress(address)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="address-card__btn address-card__btn--delete"
                          onClick={() => setShowDeleteConfirm(address)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="addresses-empty">
                <div className="addresses-empty__icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <p className="addresses-empty__text">You don't have any shipping address yet</p>
                <p className="addresses-empty__hint">Add an address to make checkout faster</p>
                <button
                  type="button"
                  className="btn btn--primary btn--large"
                  onClick={() => setAddAddress(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add new address
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {addAddress && (
        <AddAddress
          onCancel={() => setAddAddress(false)}
          onSaved={() => setAddAddress(false)}
        />
      )}

      {editingAddress && (
        <EditAddress
          address={editingAddress}
          onCancel={() => setEditingAddress(null)}
          onSaved={() => setEditingAddress(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__icon modal__icon--warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="modal__title">Delete address</h3>
            <p className="modal__message">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => onDeleteAddress(showDeleteConfirm.id)}
                disabled={deletingId === showDeleteConfirm.id}
              >
                {deletingId === showDeleteConfirm.id ? (
                  <>
                    <span className="spinner spinner--small"></span>
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
