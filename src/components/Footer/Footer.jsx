import React from 'react'
import logo from '../../assets/images/logo.png';
import vnpayLogo from '../../assets/images/vnpay.png';
import momoLogo from '../../assets/images/momo.png';
import stripeLogo from '../../assets/images/stripe.png';

const Footer = ({content}) => {
  if (!content || !content.items) return null;
  return (
    <div className="relative mt-16 bg-white">
      <hr className="border-t border-gray-300" />
      <div className="pt-12 mx-auto pb-10 sm:pb-10 lg:pb-1 sm:max-w-xl md:max-w-full px-5 md:px-12 lg:px-15">
        <div className="grid gap-16 row-gap-10 mb-8 lg:grid-cols-6">
          <div className="w-full md:max-w-xl lg:col-span-2 mx-auto text-center lg:text-left lg:mx-0">
            <a href="/" aria-label="Go home" title="Drobee" className="inline-flex items-center justify-center lg:justify-start">
              <img src={logo} alt='logo' className='h-10 lg:h-12 xl:h-14 object-contain' />
            </a>
            <div className="mt-4 md:max-w-xl lg:max-w-sm mx-auto lg:mx-0">
              <p className="text-sm text-gray-600 leading-relaxed">
                Cửa hàng thời trang trực tuyến mang đến xu hướng mới nhất và phong cách hiện đại cho mọi giới tính.
              </p>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
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
            <img src={stripeLogo} alt="Stripe" className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer
