export const Footer = () => {
  return (
    <div className="relative mt-16 bg-pink-400">
      <svg
        className="absolute top-0 w-full h-6 -mt-5 sm:-mt-10 sm:h-16 text-pink-400"
        preserveAspectRatio="none"
        viewBox="0 0 1440 54"
      >
        <path
          fill="currentColor"
          d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
        />
      </svg>
      <div className="px-4 pt-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className="grid gap-16 row-gap-10 mb-8 lg:grid-cols-6">
          <div className="md:max-w-md lg:col-span-2">
            <a href="/" aria-label="Go home" title="Fashionista" className="inline-flex items-center">
              <svg
                className="w-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16v16H4z" />
              </svg>
              <span className="ml-2 text-xl font-bold tracking-wide text-white uppercase">
                Fashionista
              </span>
            </a>
            <div className="mt-4 lg:max-w-sm">
              <p className="text-sm text-pink-100">
                Cửa hàng thời trang trực tuyến mang đến xu hướng mới nhất và phong cách hiện đại cho mọi giới tính.
              </p>
              <p className="mt-4 text-sm text-pink-100">
                Cam kết chất lượng, mẫu mã đa dạng, giao hàng nhanh chóng toàn quốc.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 row-gap-8 lg:col-span-4 md:grid-cols-4">
            <div>
              <p className="font-semibold tracking-wide text-white">Sản phẩm</p>
              <ul className="mt-2 space-y-2">
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Áo sơ mi</a></li>
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Đầm</a></li>
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Quần jeans</a></li>
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Giày & phụ kiện</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold tracking-wide text-white">Dành cho</p>
              <ul className="mt-2 space-y-2">
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Nam</a></li>
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Nữ</a></li>
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Trẻ em</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold tracking-wide text-white">Hỗ trợ</p>
              <ul className="mt-2 space-y-2">
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Chính sách đổi trả</a></li>
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Vận chuyển</a></li>
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Hướng dẫn mua hàng</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold tracking-wide text-white">Liên hệ</p>
              <ul className="mt-2 space-y-2">
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Facebook</a></li>
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Instagram</a></li>
                <li><a href="/" className="transition-colors duration-300 text-pink-100 hover:text-white">Zalo</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between pt-5 pb-10 border-t border-pink-300 sm:flex-row">
          <p className="text-sm text-white">
            © {new Date().getFullYear()} Fashionista. Bản quyền thuộc về cửa hàng thời trang trực tuyến.
          </p>
          <div className="flex items-center mt-4 space-x-4 sm:mt-0">
            {/* Social media icons giữ nguyên */}
          </div>
        </div>
      </div>
    </div>
  );
};
