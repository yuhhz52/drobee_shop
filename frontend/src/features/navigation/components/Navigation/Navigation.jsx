import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiSearch,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiMail,
  FiChevronRight,
} from 'react-icons/fi';
import BrandLogo from '@shared/components/BrandLogo/BrandLogo';
import { getAllProducts } from '@services/product.service';
import { fetchCategories } from '@services/category.service';
import { loadCategories } from '@app/store/slices/category.jsx';
import { loadUserInfo, selectUserInfo } from '@app/store/slices/user.jsx';
import { fetchUserDetails } from '@services/user.service';
import { getAccessToken, isTokenValid } from '@shared/utils/jwt-helper';
import { buildUserInitial, resolveAvatarUrl } from '@shared/utils/avatar';
import { getPrimaryResourceUrl } from '@shared/utils/product-media';
import NavDropdown from './NavDropdown';
import { buildNavMenus, languages } from './navMenuData';
import './Navigation.css';

const topAnnouncement = '🎁 UP TO -330€ OFF | CODE: VEPACE 🔥';

const Navigation = () => {
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const searchTimeout = useRef(null);
  const closeTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const categories = useSelector((state) => state.categoryState.categories);
  const userInfo = useSelector(selectUserInfo);
  const cartLength = useSelector((state) =>
    state.cartState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  );
  const isLoggedIn = isTokenValid(getAccessToken());

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
    setLangOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (categories?.length) return;
    fetchCategories()
      .then((res) => dispatch(loadCategories(res)))
      .catch(() => {});
  }, [categories?.length, dispatch]);

  useEffect(() => {
    if (!isLoggedIn || userInfo?.email) return;
    fetchUserDetails()
      .then((res) => dispatch(loadUserInfo(res)))
      .catch(() => {});
  }, [dispatch, isLoggedIn, userInfo?.email]);

  const navMenus = buildNavMenus(categories);
  const avatarUrl = resolveAvatarUrl(userInfo?.avatarUrl);
  const accountInitial = buildUserInitial(userInfo);

  useEffect(() => {
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
      } catch {
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  const handleSelectProduct = (slug) => {
    setSearchTerm('');
    setSearchResults([]);
    navigate(`/product/${slug}`);
  };

  const closeDropdownSoon = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  const openDropdownNow = (label) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  };

  const toggleMobileSection = (label) => {
    setMobileExpanded((prev) => (prev === label ? null : label));
  };

  return (
    <div className="kalles-site-header">
      <div className="vepace-topbar">
        <div className="vepace-header__container vepace-topbar__inner">
          <span className="vepace-topbar__promo">{topAnnouncement}</span>
          <button type="button" className="vepace-topbar__btn">
            <FiMail size={12} aria-hidden />
            Subscribe
          </button>
        </div>
      </div>

      <header className="vepace-header">
        <div className="vepace-header__container vepace-header__row">
          <BrandLogo linkClassName="vepace-logo" />

          <form
            className="vepace-search"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim()) {
                navigate(`/products?name=${encodeURIComponent(searchTerm)}`);
              }
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="vepace-search__submit" aria-label="Search">
              <FiSearch size={18} />
            </button>
            {searchTerm && (
              <div className="vepace-search__results">
                {loadingSearch ? (
                  <div className="vepace-search__empty">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((product) => {
                    const imageUrl = getPrimaryResourceUrl(product?.productResources);
                    return (
                      <button
                        key={product.id}
                        className="vepace-search__item"
                        type="button"
                        onClick={() => handleSelectProduct(product.slug)}
                      >
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt=""
                            onError={(event) => {
                              event.target.onerror = null;
                              event.target.style.display = 'none';
                            }}
                          />
                        )}
                        <span>{product.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="vepace-search__empty">No matching products</div>
                )}
              </div>
            )}
          </form>

          <div className="vepace-actions">
            <div
              className="vepace-language-wrap"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button type="button" className="vepace-language">
                <span className="vepace-language__label">Language</span>
                <span className="vepace-language__value">
                  English <FiChevronDown size={12} />
                </span>
              </button>
              {langOpen && (
                <ul className="vepace-lang-dropdown">
                  {languages.map((lang) => (
                    <li key={lang}>
                      <button type="button">{lang}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          <Link
            to={isLoggedIn ? '/account-details/profile' : '/v1/login'}
            className="vepace-account"
          >
            {isLoggedIn && (
              avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="vepace-account__avatar" />
              ) : (
                <span className="vepace-account__avatar vepace-account__avatar--placeholder">
                  {accountInitial}
                </span>
              )
            )}
            <span className="vepace-account__top">{isLoggedIn ? 'Welcome back' : 'Login / Signup'}</span>
            <span className="vepace-account__main">My account</span>
          </Link>
            <Link to="/cart-items" className="vepace-cart">
              <span className="vepace-cart__icon-wrap">
                <FiShoppingCart size={20} />
                <span className="vepace-cart__badge">{cartLength}</span>
              </span>
              <span>Cart</span>
            </Link>
          </div>
        </div>
      </header>

      <nav className="vepace-category-nav" aria-label="Categories">
        <div className="vepace-header__container vepace-category-nav__inner">
          {navMenus.map((menu) => {
            const hasDropdown = Boolean(menu.columns?.length);
            const isOpen = openDropdown === menu.label;

            return (
              <div
                key={menu.label}
                className={`vepace-nav-item ${isOpen ? 'is-open' : ''} ${
                  menu.label === 'Contact' ? 'vepace-nav-item--right' : ''
                }`}
                onMouseEnter={() => hasDropdown && openDropdownNow(menu.label)}
                onMouseLeave={() => hasDropdown && closeDropdownSoon()}
              >
                <Link
                  to={menu.to}
                  className={`vepace-category__item ${isOpen ? 'is-active' : ''}`}
                >
                  {menu.label}
                  {hasDropdown && (
                    <FiChevronDown size={12} className="vepace-category__chevron" />
                  )}
                </Link>
                {hasDropdown && isOpen && (
                  <NavDropdown
                    menu={menu}
                    onNavigate={() => setOpenDropdown(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="kalles-mobile-bar">
        <div className="vepace-header__container kalles-mobile-bar__inner">
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
            <Link className="kalles-nav__icon" to="/cart-items" aria-label="Cart">
              <FiShoppingCart size={18} />
              {cartLength > 0 && (
                <span className="kalles-nav__cart-badge">{cartLength}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="kalles-mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="kalles-mobile-panel" onClick={(e) => e.stopPropagation()}>
            <div className="kalles-mobile-panel__head">
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
              {navMenus.map((menu) => {
                const hasChildren = Boolean(menu.columns?.length);
                const expanded = mobileExpanded === menu.label;

                return (
                  <div key={menu.label} className="kalles-mobile-section">
                    <div className="kalles-mobile-section__row">
                      <Link
                        to={menu.to}
                        className="kalles-mobile-section__link"
                        onClick={() => !hasChildren && setMenuOpen(false)}
                      >
                        {menu.label}
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          className={`kalles-mobile-section__toggle ${expanded ? 'is-open' : ''}`}
                          aria-expanded={expanded}
                          onClick={() => toggleMobileSection(menu.label)}
                        >
                          <FiChevronRight size={16} />
                        </button>
                      )}
                    </div>
                    {hasChildren && expanded && (
                      <div className="kalles-mobile-submenu">
                        {menu.columns.map((column, idx) => (
                          <div key={column.title || idx} className="kalles-mobile-submenu__group">
                            {column.title && (
                              <Link
                                to={column.to || menu.to}
                                className="kalles-mobile-submenu__title"
                                onClick={() => setMenuOpen(false)}
                              >
                                {column.title}
                              </Link>
                            )}
                            {column.links?.map((link) => (
                              <Link
                                key={link.label}
                                to={link.to}
                                onClick={() => setMenuOpen(false)}
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;
