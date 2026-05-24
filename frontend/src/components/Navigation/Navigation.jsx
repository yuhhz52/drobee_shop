
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch, FiShoppingCart, FiUser, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import BrandLogo from '../BrandLogo/BrandLogo';
import { getAllProducts } from '../../api/fetchProducts';
import { formatDisplayPrice } from '../../utils/price-format';
import './Navigation.css';

const announcementItems = [
  'Sign up and get 10% off your first order',
  'Free delivery for order over $120',
  'End year sale up to 50% off',
];

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shops', badge: 'New', badgeType: 'new' },
  { label: 'Products', to: '/products' },
  { label: 'Sale', to: '/sale', badge: 'Sale', badgeType: 'sale' },
  { label: 'Pages', to: '/shops' },
  { label: 'Lookbook', to: '/women' },
  { label: 'Blog', to: '/accessories' },
];

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchTimeout = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const cartLength = useSelector(state => state.cartState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0));

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    isActive ? 'kalles-nav__item kalles-nav__item--active' : 'kalles-nav__item';

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
        const { products } = await getAllProducts({
          categoryId: null,
          typeIds: [],
          name: searchTerm,
          page: 0,
          size: 5,
        });

        setSearchResults(products || []);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, searchOpen]);

  const handleSelectProduct = (slug) => {
    setSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
    navigate(`/product/${slug}`);
  };

  return (
    <div className="kalles-site-header">
      {announcementOpen && (
        <div className="kalles-announcement">
          <div className="kalles-announcement__track">
            {[...announcementItems, ...announcementItems].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
          <button
            className="kalles-announcement__close"
            type="button"
            onClick={() => setAnnouncementOpen(false)}
            aria-label="Close announcement"
          >
            <FiX />
          </button>
        </div>
      )}

      <header className="kalles-header">
        <div className="kalles-nav">
          <BrandLogo linkClassName="kalles-nav__logo" />

          <nav className="kalles-nav__menu">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/'}
                className={navLinkClass}
              >
                {link.label}
                {link.badge && (
                  <span
                    className={`kalles-nav__badge kalles-nav__badge--${link.badgeType}`}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="kalles-nav__icons">
            <button
              className="kalles-nav__icon"
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <FiSearch size={18} />
            </button>
            <button
              className="kalles-nav__icon"
              type="button"
              onClick={() => navigate('/account-details/profile')}
              aria-label="Account"
            >
              <FiUser size={18} />
            </button>
            <Link className="kalles-nav__icon" to="/new-arrivals" aria-label="Wishlist">
              <FiHeart size={18} />
            </Link>
            <Link className="kalles-nav__icon" to="/cart-items" aria-label="Cart">
              <FiShoppingCart size={18} />
              {cartLength > 0 && (
                <span className="kalles-nav__cart-badge">{cartLength}</span>
              )}
            </Link>
          </div>
        </div>

        <div className="kalles-mobile-bar">
          <div className="kalles-mobile-bar__left">
            <button
              className="kalles-nav__icon"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={20} />
            </button>
            <BrandLogo linkClassName="kalles-nav__logo" />
          </div>
          <div className="kalles-nav__icons">
            <button
              className="kalles-nav__icon"
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <FiSearch size={18} />
            </button>
            <Link className="kalles-nav__icon" to="/cart-items" aria-label="Cart">
              <FiShoppingCart size={18} />
              {cartLength > 0 && (
                <span className="kalles-nav__cart-badge">{cartLength}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="kalles-mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="kalles-mobile-panel" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <BrandLogo className="zentro-logo--sm" />
              <button
                className="kalles-nav__icon"
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="kalles-mobile-links">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={navLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="kalles-search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="kalles-search-box" onClick={(event) => event.stopPropagation()}>
            <div className="kalles-search-input">
              <FiSearch className="text-gray-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search for products"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            {searchTerm && (
              <div className="kalles-search-results">
                {loadingSearch ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="kalles-search-item"
                      onClick={() => handleSelectProduct(product.slug)}
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                        onError={(event) => {
                          event.target.onerror = null;
                          event.target.style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">{formatDisplayPrice(product.price)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No matching products</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;