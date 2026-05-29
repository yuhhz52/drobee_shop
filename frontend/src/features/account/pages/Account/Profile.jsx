import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeAddress, selectUserInfo, updateAvatar } from '@app/store/slices/user.jsx';
import AddAddress from './AddAddress';
import { setLoading } from '@app/store/slices/common.jsx';
import { deleteAddressAPI, uploadAvatar } from '@services/user.service';
import { buildUserInitial, resolveAvatarUrl } from '@shared/utils/avatar';
import { preprocessAvatarImage } from '@shared/utils/image';

const MAX_AVATAR_UPLOAD_SIZE = 5 * 1024 * 1024;

const Profile = () => {
  const userInfo = useSelector(selectUserInfo);
  const [addAddress, setAddAddress] = useState();
  const [avatarError, setAvatarError] = useState('');
  const dispatch = useDispatch();

  const onDeleteAddress = useCallback((id) => {
    dispatch(setLoading(true));
    deleteAddressAPI(id).then(res => {
      dispatch(removeAddress(id));
    }).catch(err => {

    }).finally(() => {
      dispatch(setLoading(false));
    })
  }, [dispatch]);

  const onUploadAvatar = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarError('');

    if (!file.type?.startsWith('image/')) {
      setAvatarError('Vui lòng chọn file ảnh hợp lệ.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_UPLOAD_SIZE) {
      setAvatarError('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
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
          'Không thể cập nhật avatar. Vui lòng thử lại.';
        setAvatarError(message);
      })
      .finally(() => {
        dispatch(setLoading(false));
        event.target.value = '';
      });
  }, [dispatch]);

  const avatarUrl = resolveAvatarUrl(userInfo?.avatarUrl);


  return (
    <div className="vepace-profile-panel">
        <h1 className="vepace-profile-title">Tài khoản của tôi</h1>
        {!addAddress && (
          <div>
            <div className="vepace-profile-card">
              <div className="vepace-profile-avatar-wrap">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="vepace-profile-avatar" />
                ) : (
                  <div className="vepace-profile-avatar vepace-profile-avatar--placeholder">
                    {buildUserInitial(userInfo)}
                  </div>
                )}
                <div>
                  <label className="vepace-btn vepace-btn--outline vepace-avatar-upload-btn">
                    Đổi avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onUploadAvatar}
                      className="vepace-avatar-input"
                    />
                  </label>
                  <p className="vepace-avatar-hint">Ảnh sẽ tự crop vuông 512x512 (tối đa 5MB).</p>
                  {avatarError && <p className="vepace-form-error">{avatarError}</p>}
                </div>
              </div>
              <div>
                <div className="vepace-profile-row">
                  <strong>Họ tên:</strong>
                  <span>{userInfo?.firstName || ''} {userInfo?.lastName || ''}</span>
                </div>

                <div className="vepace-profile-row">
                  <strong>Số điện thoại:</strong>
                  <span>{userInfo?.phoneNumber || 'Chưa cập nhật'}</span>
                </div>

                <div className="vepace-profile-row">
                  <strong>Email:</strong>
                  <span>{userInfo?.email || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="vepace-address-head">
                <h3>Địa chỉ giao hàng</h3>
                <button
                  type="button"
                  className="vepace-btn vepace-btn--dark"
                  onClick={() => setAddAddress(true)}
                >
                  Thêm địa chỉ
                </button>
              </div>

              {userInfo?.addressList?.length ? (
                <div className="vepace-address-grid">
                  {userInfo?.addressList?.map((address, index) => (
                    <div
                      key={index}
                      className="vepace-address-card"
                    >
                      <p>{address?.name}</p>
                      <p>{address?.phoneNumber}</p>
                      <p>
                        {address?.street}, {address?.city}, {address?.state}
                      </p>
                      <p>{address?.zipCode}</p>

                      <div className="vepace-address-actions">
                        <button
                          type="button"
                          onClick={() => console.log('Edit address')}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="text-sm text-red-600 hover:underline"
                          onClick={() => onDeleteAddress(address?.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="vepace-address-empty">
                  Bạn chưa có địa chỉ giao hàng nào. Hãy thêm địa chỉ để tiện thanh toán.
                </div>
              )}
            </div>
          </div>
        )}
        {addAddress && (
          <div>
            <AddAddress onCancel={() => setAddAddress(false)} />
          </div>
        )}
    </div>
  )
}

export default Profile