import React from 'react'
import store from '../../assets/images/store.png'
import NewsletterSignup from '../../components/NewsletterSignup'

const shops = [
  {
    label: 'Drobee Shop',
    address: '121 Cầu Giấy, Hà Nội',
    isNew: true,
    mapUrl: 'https://www.google.com/maps/place/121+Cầu+Giấy,+Hà+Nội'
  },
  {
    label: 'Drobee Shop',
    address: '45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    isNew: false,
    mapUrl: 'https://www.google.com/maps/place/45+Nguyễn+Huệ,+Quận+1,+TP+HCM'
  },
  {
    label: 'Drobee Shop',
    address: '99 Hoàng Quốc Việt, Hà Nội',
    isNew: true,
    mapUrl: 'https://www.google.com/maps/place/99+Hoàng+Quốc+Việt,+Hà+Nội'
  },
  {
    label: 'Drobee Shop',
    address: '320 Lê Văn Sỹ, Quận 3, TP. Hồ Chí Minh',
    isNew: false,
    mapUrl: 'https://www.google.com/maps/place/320+Lê+Văn+Sỹ,+Quận+3,+TP+HCM'
  },
  {
    label: 'Drobee Shop',
    address: '12 Phạm Hùng, Nam Từ Liêm, Hà Nội',
    isNew: true,
    mapUrl: 'https://www.google.com/maps/place/12+Phạm+Hùng,+Nam+Từ+Liêm,+Hà+Nội'
  },
  {
    label: 'Drobee Shop',
    address: '88 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh',
    isNew: false,
    mapUrl: 'https://www.google.com/maps/place/88+Trần+Hưng+Đạo,+Quận+5,+TP+HCM'
  }
]

const ShopPages = () => {
  return (
    <>
      <div className=" py-10 px-5 md:px-12 lg:px-15 my-10">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Cửa hàng của chúng tôi</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {shops.map((shop, index) => (
            <a
              key={index}
              href={shop.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-104 bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4">
                <img src={store} alt="store" className="w-full h-full object-contain rounded-full" />
              </div>
              <p className="text-gray-800 text-base font-semibold">{shop.label}</p>
              <p className="text-gray-600 text-sm">{shop.address}</p>
              {shop.isNew && (
                <span className="inline-block mt-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">NEW</span>
              )}
            </a>
          ))}
        </div>
      </div>
      <NewsletterSignup />
    </>
  )
}

export default ShopPages
