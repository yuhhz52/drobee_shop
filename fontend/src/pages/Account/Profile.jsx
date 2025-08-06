import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeAddress, selectUserInfo } from "../../store/features/user";
import AddAddress from "./AddAddress";
import { setLoading } from "../../store/features/common";
import { deleteAddressAPI } from "../../api/userInfo.js";

const Profile = () => {
  const userInfo = useSelector(selectUserInfo);
  const [addAddress, setAddAddress] = useState();
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


  return (
    <div className='px-10'>
      <h1 className="text-2xl">Tài khoản của tôi</h1>
      {!addAddress && (
        <div>
          <div className="pt-4 space-y-2 text-sm text-gray-800">
            <div className="flex">
              <span className="font-semibold w-[120px] text-gray-700">Họ tên:</span>
              <span>{userInfo?.firstName || ''} {userInfo?.lastName || ''}</span>
            </div>

            <div className="flex">
              <span className="font-semibold w-[120px] text-gray-700">Số điện thoại:</span>
              <span>{userInfo?.phoneNumber || 'Chưa cập nhật'}</span>
            </div>

            <div className="flex">
              <span className="font-semibold w-[120px] text-gray-700">Email:</span>
              <span>{userInfo?.email || 'Chưa cập nhật'}</span>
            </div>
          </div>
          {/* Addresses */}
          <div className="pt-4">
            <div className="flex items-center  mb-4">
              <h3 className="text-xl font-bold text-gray-800">Địa chỉ giao hàng</h3>
              <div
                className="px-4"
                onClick={() => setAddAddress(true)}
              >
                Thêm địa chỉ
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userInfo?.addressList?.map((address, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-300 rounded-xl shadow-sm p-4 hover:shadow-md transition"
                >
                  <p className="font-semibold text-gray-800">{address?.name}</p>
                  <p className="text-sm text-gray-600">{address?.phoneNumber}</p>
                  <p className="text-sm text-gray-600">
                    {address?.street}, {address?.city}, {address?.state}
                  </p>
                  <p className="text-sm text-gray-600">{address?.zipCode}</p>

                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      className="flex items-center text-blue-600 hover:underline"
                      onClick={() => console.log('Edit address')}
                    >
                      Sửa
                    </button>
                    <button
                      className="flex items-center text-red-600 hover:underline"
                      onClick={() => onDeleteAddress(address?.id)}
                    >
                       Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {addAddress && <AddAddress onCancel={() => setAddAddress(false)} />}
    </div>
  )
}

export default Profile