
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiHome, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import logo from '../../assets/images/logo.png';
import { getAllProducts } from '../../api/fetchProducts';
import { formatDisplayPrice } from '../../utils/price-format';


const navs = [
  { to: '/', icon: <FiHome size={22} />, label: 'Trang chủ' },
  { type: 'search', icon: <FiSearch size={22} />, label: 'Tìm kiếm' },
  { to: '/cart-items', icon: <FiShoppingCart size={22} />, label: 'Cart' },
  { to: '/account-details/profile', icon: <FiUser size={22} />, label: 'Tài khoản' },
];

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchTimeout = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const cartLength = useSelector(state => state.cartState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0));

  const navLinkClass = ({ isActive }) =>
    isActive ? 'text-[#212121] font-semibold border-b-2 border-[#212121]' : 'text-gray-600 hover:text-[#212121]';

  // Xử lý tìm kiếm sản phẩm
  useEffect(() => {
    if (!searchOpen) {
      setSearchTerm('');
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }
    if (!searchTerm) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }
    setLoadingSearch(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        // Gọi API tìm kiếm tối ưu với tham số name
        const data = await getAllProducts(null, [], searchTerm);
        setSearchResults(data || []);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, searchOpen]);

  return (
    <>
      {/* Hiện thanh tìm kiếm */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-start justify-center bg-black/60 transition-opacity"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl mx-4 mt-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-lg flex flex-col px-6 py-4 w-full">
              <div className="flex items-center">
                <FiSearch className="h-5 w-5 text-gray-700 mr-3" />
                <input
                  autoFocus
                  type="text"
                  className="flex-1 bg-transparent outline-none text-lg placeholder-gray-400"
                  placeholder="Tìm kiếm ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Kết quả tìm kiếm */}
              {searchTerm && (
                <div className="absolute left-0 right-0 mt-12 bg-white rounded-xl shadow-lg max-h-80 overflow-y-auto border border-gray-200">
                  {loadingSearch ? (
                    <div className="p-4 text-center text-gray-500">Đang tìm kiếm...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.slice(0, 5).map(product => {
                      const imageSrc = product.thumbnail;
                      return (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchTerm('');
                            setSearchResults([]);
                            navigate(`/product/${product.slug}`);
                          }}
                        >
                          <img src={imageSrc} alt={product.name} className="w-10 h-10 object-cover rounded" onError={e => { e.target.onerror = null; e.target.src = logo }} />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500">{formatDisplayPrice(product.price)}</div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm phù hợp</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Top Navigation (Desktop/Tablet) */}
      <nav className='fixed top-0 left-0 right-0 z-10 hidden lg:flex items-center py-4 px-4 lg:py-6 lg:px-10 xl:px-16 justify-between bg-white shadow-md'>
        {/* Logo */}
        <div className='flex items-center'>
          <NavLink to='/'>
            <img src={logo} alt='logo' className='h-10 lg:h-12 xl:h-14 object-contain' />
          </NavLink>
        </div>
        {/* Main menu */}
        <div className='flex flex-wrap items-center'>
          <ul className='flex gap-6 lg:gap-10 xl:gap-14 text-[16px] font-medium text-gray-600'>
            <li><NavLink to='/men' className={navLinkClass}>Thời trang nam</NavLink></li>
            <li><NavLink to='/women' className={navLinkClass}>Thời trang nữ</NavLink></li>
            <li><NavLink to='/accessories' className={navLinkClass}>Phụ kiện</NavLink></li>
            <li><NavLink to='/shops' className={navLinkClass}>Cửa hàng</NavLink></li>
          </ul>
        </div>
        {/* Search and Action Items */}
        <div className='flex items-center'>
          <ul className='flex gap-6 xl:gap-10 items-center text-gray-600'>
            {/* Search */}
            <li>
              <button
                className='p-2 rounded-full focus:outline-none'
                onClick={() => setSearchOpen(true)}
                aria-label="Mở search"
              >
                <FiSearch className='h-6 w-6 text-gray-700' />
              </button>
            </li>

            {/* Profile */}
            <li>
              <button onClick={() => navigate('/account-details/profile')}>
                <FiUser className='h-6 w-6 text-gray-700' />
              </button>
            </li>

            {/* Cart */}
            <li>
              <Link to='/cart-items' className='relative flex'>
                <FiShoppingCart className='h-6 w-6 text-gray-700' />
                {cartLength > 0 && (
                  <div className='absolute left-4 -top-2 h-5 w-5 text-xs bg-black text-white rounded-full border-2 border-white flex items-center justify-center'>
                    {cartLength}
                  </div>
                )}
              </Link>
            </li>
          </ul>
        </div>

      </nav>

      {/* Hamburger + Mobile Menu Overlay */}
      <div className='lg:hidden flex items-center py-4 px-4 justify-between fixed top-0 left-0 right-0 z-[100] bg-white shadow-md'>
        <NavLink to='/'>
          <img src={logo} alt='logo' className='h-10 object-contain' />
        </NavLink>
        <div className='flex items-center gap-3'>

          <button onClick={() => setMenuOpen(!menuOpen)} className='focus:outline-none'>
            <svg className='w-7 h-7 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
        {/* Open Menu */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-60 bg-black/60 transition-opacity duration-300 lg:hidden"
              onClick={() => setMenuOpen(false)}
            >
              {/* Nút X ở góc trên bên phải */}
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-4 right-4 z-70 bg-white rounded-full p-2 shadow focus:outline-none"
                aria-label="Đóng menu"
              >
                <svg className='w-7 h-7 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            <div className="fixed top-0 left-0 h-full w-64 bg-white z-70 shadow-lg transform translate-x-0 transition-transform duration-200">
              <div className='flex items-center justify-between px-6 py-4 border-b'>
                <NavLink to='/' onClick={() => setMenuOpen(false)}>
                  <img src={logo} alt='logo' className='h-10 object-contain' />
                </NavLink>
              </div>
              <ul className='flex flex-col gap-6 px-6 py-6'>
                <li><NavLink to='/men' className={navLinkClass} onClick={() => setMenuOpen(false)}>Thời trang nam</NavLink></li>
                <li><NavLink to='/women' className={navLinkClass} onClick={() => setMenuOpen(false)}>Thời trang nữ</NavLink></li>
                <li><NavLink to='/accessories' onClick={() => setMenuOpen(false)} className={navLinkClass}>Phụ kiện</NavLink></li>
                <li><NavLink to='/shops' className={navLinkClass} onClick={() => setMenuOpen(false)} >Cửa hàng</NavLink></li>
              </ul>
            </div>
          </>
        )}

      </div>

      {/* Bottom Navigation (Mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white flex justify-around items-center h-16 lg:hidden shadow">
        {navs.map((nav) =>
          nav.type === 'search' ? (
            <button
              key="search"
              type="button"
              onClick={() => setSearchOpen(true)}
              className={`flex flex-col items-center justify-center flex-1 h-full ${searchOpen ? 'text-black font-semibold' : 'text-gray-500'}`}
              aria-label="Mở search"
            >
              <div className="relative">
                {nav.icon}
              </div>
            </button>
          ) : (
            <Link
              key={nav.to}
              to={nav.to}
              className={`flex flex-col items-center justify-center flex-1 h-full ${location.pathname === nav.to ? 'text-black font-semibold' : 'text-gray-500'}`}
            >
              <div className="relative">
                {nav.label === 'Cart' && cartLength > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white rounded-full text-xs w-5 h-5 flex items-center justify-center border border-white">{cartLength}</span>
                )}
                {nav.icon}
              </div>
            </Link>
          )
        )}
      </nav>
    </>
  );
};

export default Navigation;