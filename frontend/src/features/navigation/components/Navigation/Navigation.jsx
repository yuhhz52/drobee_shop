import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiSearch,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiUser,
} from 'react-icons/fi';
import BrandLogo from '@shared/components/BrandLogo/BrandLogo';
import { getAllProducts } from '@services/product.service';
import { fetchCategories } from '@services/category.service';
import { loadCategories } from '@app/store/slices/category.jsx';
import { loadUserInfo, selectUserInfo } from '@app/store/slices/user.jsx';
import { fetchUserDetails } from '@services/user.service';
import { fetchCart } from '@app/store/actions/cartAction';
import { getAccessToken, isTokenValid } from '@shared/utils/jwt-helper';
import { buildUserInitial, resolveAvatarUrl } from '@shared/utils/avatar';
import { getPrimaryResourceUrl } from '@shared/utils/product-media';
import NavDropdown from './NavDropdown';
import { buildNavMenus, languages } from './navMenuData';
import './Navigation.css';

const Navigation = () => {
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
    state.cartState.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  );
  const isLoggedIn = isTokenValid(getAccessToken());

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
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

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

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
      <header className="horizon-header">
        <div className="horizon-header__container horizon-header__row">
          <BrandLogo linkClassName="horizon-logo" />

          <form
            className="horizon-search"
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
            <button type="submit" className="horizon-search__submit" aria-label="Search">
              <FiSearch size={18} />
            </button>
            {searchTerm && (
              <div className="horizon-search__results">
                {loadingSearch ? (
                  <div className="horizon-search__empty">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((product) => {
                    const imageUrl = getPrimaryResourceUrl(product?.productResources);
                    return (
                      <button
                        key={product.id}
                        className="horizon-search__item"
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
                  <div className="horizon-search__empty">No matching products</div>
                )}
              </div>
            )}
          </form>

          <div className="horizon-actions">
            <div
              className="horizon-language-wrap"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button type="button" className="horizon-language">
                <span className="horizon-language__label">Language</span>
                <span className="horizon-language__value">
                  English <FiChevronDown size={12} />
                </span>
              </button>
              {langOpen && (
                <ul className="horizon-lang-dropdown">
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
            className="horizon-account"
          >
            {isLoggedIn && (
              avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="horizon-account__avatar" />
              ) : (
                <span className="horizon-account__avatar horizon-account__avatar--placeholder">
                  {accountInitial}
                </span>
              )
            )}
            <span className="horizon-account__top">{isLoggedIn ? '' : 'Login / Signup'}</span>
          </Link>
            <Link to="/cart-items" className="horizon-cart">
              <span className="horizon-cart__icon-wrap">
                <FiShoppingCart size={20} />
                {cartLength > 0 && (
                  <span className="horizon-cart__badge">{cartLength}</span>
                )}
              </span>
              <span>Cart</span>
            </Link>
          </div>
        </div>
      </header>

      <nav className="horizon-category-nav" aria-label="Categories">
        <div className="horizon-header__container horizon-category-nav__inner">
          {navMenus.map((menu) => {
            const hasDropdown = Boolean(menu.columns?.length);
            const isOpen = openDropdown === menu.label;

            return (
              <div
                key={menu.key || menu.label}
                className={`horizon-nav-item ${isOpen ? 'is-open' : ''} ${
                  menu.label === 'Contact' ? 'horizon-nav-item--right' : ''
                }`}
                onMouseEnter={() => hasDropdown && openDropdownNow(menu.label)}
                onMouseLeave={() => hasDropdown && closeDropdownSoon()}
              >
                <Link
                  to={menu.to}
                  className={`horizon-category__item ${isOpen ? 'is-active' : ''}`}
                >
                  {menu.label}
                  {hasDropdown && (
                    <FiChevronDown size={12} className="horizon-category__chevron" />
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
        <div className="horizon-header__container kalles-mobile-bar__inner">
          <button
            className="kalles-nav__icon"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>

          <BrandLogo linkClassName="kalles-nav__logo" />

          <div className="kalles-nav__icons">
            <button
              className="kalles-nav__icon"
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <FiSearch size={18} />
            </button>
            <Link
              className="kalles-nav__icon"
              to={isLoggedIn ? '/account-details/profile' : '/v1/login'}
              aria-label="Account"
            >
              {isLoggedIn ? (
                avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="kalles-nav__avatar" />
                ) : (
                  <span className="kalles-nav__avatar-placeholder">
                    {accountInitial}
                  </span>
                )
              ) : (
                <FiUser size={18} />
              )}
            </Link>
            <Link className="kalles-nav__icon kalles-nav__icon--cart" to="/cart-items" aria-label="Cart">
              <FiShoppingCart size={18} />
              {cartLength > 0 && (
                <span className="horizon-cart__badge">{cartLength}</span>
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
              <div className="kalles-mobile-section kalles-mobile-section--account">
                <Link
                  to={isLoggedIn ? '/account-details/profile' : '/v1/login'}
                  className="kalles-mobile-section__link kalles-mobile-section__link--account"
                  onClick={() => setMenuOpen(false)}
                >
                  {isLoggedIn && avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="kalles-mobile-avatar" />
                  ) : (
                    <FiUser size={16} />
                  )}
                  <span>{isLoggedIn ? 'My Account' : 'Login / Signup'}</span>
                </Link>
              </div>
              {navMenus.map((menu) => {
                const hasChildren = Boolean(menu.columns?.length);
                const expanded = mobileExpanded === menu.label;

                return (
                  <div key={menu.key || menu.label} className="kalles-mobile-section">
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
                                key={link.key || link.label}
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

      {searchOpen && (
        <div className="kalles-mobile-search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="kalles-mobile-search-panel" onClick={(e) => e.stopPropagation()}>
            <form
              className="kalles-mobile-search-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchTerm.trim()) {
                  navigate(`/products?name=${encodeURIComponent(searchTerm)}`);
                  setSearchOpen(false);
                }
              }}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                autoFocus
                aria-label="Search products"
              />
              <button type="submit" aria-label="Submit search">
                <FiSearch size={20} />
              </button>
            </form>
            {searchTerm && (
              <div className="kalles-mobile-search-results">
                {loadingSearch ? (
                  <div className="kalles-mobile-search-empty">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((product) => {
                    const imageUrl = getPrimaryResourceUrl(product?.productResources);
                    return (
                      <button
                        key={product.id}
                        className="kalles-mobile-search-result-item"
                        type="button"
                        onClick={() => handleSelectProduct(product.slug)}
                      >
                        {imageUrl && <img src={imageUrl} alt="" />}
                        <span>{product.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="kalles-mobile-search-empty">No matching products</div>
                )}
              </div>
            )}
            <button
              className="kalles-mobile-search-close"
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;
