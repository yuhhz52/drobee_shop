import React from 'react'
import vnpayLogo from '../../assets/images/vnpay.png';
import momoLogo from '../../assets/images/momo.png';

const Footer = ({content}) => {
  if (!content || !content.items) return null;
  return (
    <div className="relative mt-16 bg-white">
      <hr className="border-t border-gray-300" />
      <div className="px-4 pt-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className="grid gap-16 row-gap-10 mb-8 lg:grid-cols-6">
          <div className="md:max-w-md lg:col-span-2">
            <a href="/" aria-label="Go home" title="Fashionista" className="inline-flex items-center">
              <svg
                className="w-8 text-black"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="4" width="16" height="16" />
              </svg>
              <span className="ml-2 text-xl font-bold tracking-wide text-black uppercase">
                Fashionista
              </span>
            </a>
            <div className="mt-4 lg:max-w-sm">
              <p className="text-sm text-gray-600">
                Cửa hàng thời trang trực tuyến mang đến xu hướng mới nhất và phong cách hiện đại cho mọi giới tính.
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Cam kết chất lượng, mẫu mã đa dạng, giao hàng nhanh chóng toàn quốc.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 row-gap-8 lg:col-span-4 md:grid-cols-4">
            {content.items.map((item, idx) => (
              <div key={idx}>
                <p className="font-semibold tracking-wide text-black">{item.title}</p>
                <ul className="mt-2 space-y-2">
                  {item.list && item.list.map((listItem, lidx) => (
                    <li key={lidx}>
                      <a href={listItem.path || '#'} className="transition-colors duration-300 text-gray-600 hover:text-black">
                        {listItem.label}
                      </a>
                    </li>
                  ))}
                  {item.description && <li className="text-gray-600 text-sm">{item.description}</li>}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between pt-5 pb-10 border-t border-gray-200 sm:flex-row">
          <p className="text-sm text-black">
            {content?.copyright}
          </p>
          <div className="flex items-center mt-4 space-x-4 sm:mt-0">
            <img src={vnpayLogo} alt="VNPay" className="h-8" />
            <img src={momoLogo} alt="MoMo" className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer
