import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiLock } from 'react-icons/fi';
import { selectCartItems } from '@app/store/slices/cart.jsx';
import {
  updateCartItem,
  removeCartItem,
} from '@app/store/actions/cartAction';
import { formatPriceVND } from '@shared/utils/price-format';
import { inferBrandFromProduct } from '@shared/utils/product-brand';
import EmptyCart from '@assets/images/empty-cart.png';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './Cart.css';

const CartQty = ({ quantity, onChange, onRemove, decreaseLabel, increaseLabel }) => (
  <div className="horizon-cart-qty">
    <button
      type="button"
      onClick={() => (quantity <= 1 ? onRemove() : onChange(quantity - 1))}
      aria-label={decreaseLabel}
    >
      −
    </button>
    <span>{quantity}</span>
    <button type="button" onClick={() => onChange(quantity + 1)} aria-label={increaseLabel}>
      +
    </button>
  </div>
);

const Cart = () => {
  const { t } = useTranslation();
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const subTotal = useMemo(() => {
    let value = 0;
    cartItems?.forEach((el) => {
      value += el?.subTotal || 0;
    });
    return value;
  }, [cartItems]);

  const itemCount = useMemo(
    () => cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
    [cartItems]
  );

  const onChangeQuantity = useCallback(
    (value, itemId) => {
      dispatch(updateCartItem({ itemId, quantity: value }));
    },
    [dispatch]
  );

  const onDeleteProduct = useCallback((itemId) => {
    setDeleteItemId(itemId);
    setModalOpen(true);
  }, []);

  const onDeleteItem = useCallback(() => {
    if (deleteItemId) {
      dispatch(removeCartItem(deleteItemId));
    }
    setModalOpen(false);
    setDeleteItemId(null);
  }, [deleteItemId, dispatch]);

  if (!cartItems?.length) {
    return (
      <div className="horizon-cart-page">
        <div className="horizon-cart-page__header">
          <div className="horizon-cart-page__container">
            <nav className="horizon-cart-breadcrumb" aria-label={t('common.breadcrumb')}>
              <Link to="/">{t('nav.home')}</Link>
              <span>/</span>
              <span>{t('common.cart')}</span>
            </nav>
            <h1>{t('cart.title')}</h1>
          </div>
        </div>
        <div className="horizon-cart-page__container">
          <div className="horizon-cart-empty">
            <img src={EmptyCart} alt="" />
            <h2>{t('cart.emptyTitle')}</h2>
            <p>{t('cart.emptyDescription')}</p>
            <Link to="/products" className="horizon-cart-btn horizon-cart-btn--primary">
              {t('cart.exploreScooters')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="horizon-cart-page">
      <div className="horizon-cart-page__header">
        <div className="horizon-cart-page__container">
          <nav className="horizon-cart-breadcrumb" aria-label={t('common.breadcrumb')}>
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>{t('common.cart')}</span>
          </nav>
          <h1>
            {t('cart.title')}
            <span className="horizon-cart-page__count">
              ({itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')})
            </span>
          </h1>
        </div>
      </div>

      <div className="horizon-cart-page__container">
        <div className="horizon-cart-layout">
          <div className="horizon-cart-main">
            <div className="horizon-cart-table-head">
              <span>{t('cart.product')}</span>
              <span>{t('cart.quantity')}</span>
              <span>{t('cart.total')}</span>
            </div>

            <ul className="horizon-cart-items">
              {cartItems.map((item) => {
                // Use :: separator to avoid conflicts with UUID hyphens
                const itemKey = item.id || `${item.productId}::${item.variant?.id || 'default'}`;
                return (
                <li
                  key={itemKey}
                  className="horizon-cart-item"
                >
                  <div className="horizon-cart-item__product">
                    <Link
                      to={`/product/${item.productSlug || item.productId}`}
                      className="horizon-cart-item__image"
                    >
                      <img src={item.productImage} alt="" />
                    </Link>
                    <div>
                      {inferBrandFromProduct(item) && (
                        <p className="horizon-cart-item__brand">
                          {inferBrandFromProduct(item)}
                        </p>
                      )}
                      <h3>
                        <Link to={`/product/${item.productSlug || item.productId}`}>
                          {item.productName}
                        </Link>
                      </h3>
                      <p className="horizon-cart-item__meta">
                        {item.variantName && (
                          <span>{t('cart.versionWithName', { name: item.variantName })}</span>
                        )}
                        {item.variantColor && (
                          <span> · {item.variantColor}</span>
                        )}
                      </p>
                      <p className="horizon-cart-item__unit">
                        {formatPriceVND(item.unitPrice)} {t('cart.each')}
                      </p>
                    </div>
                  </div>

                  <div className="horizon-cart-item__qty-col">
                    <CartQty
                      quantity={item.quantity}
                      onChange={(v) => onChangeQuantity(v, itemKey)}
                      onRemove={() => onDeleteProduct(itemKey)}
                      decreaseLabel={t('cart.decrease')}
                      increaseLabel={t('cart.increase')}
                    />
                    <button
                      type="button"
                      className="horizon-cart-item__remove"
                      onClick={() => onDeleteProduct(itemKey)}
                      aria-label={t('common.remove')}
                    >
                      <FiTrash2 size={16} />
                      {t('cart.remove')}
                    </button>
                  </div>

                  <div className="horizon-cart-item__total">
                    {formatPriceVND(item.subTotal)}
                  </div>
                </li>
              );
              })}
            </ul>

            <div className="horizon-cart-coupon">
              <label htmlFor="coupon">{t('cart.discountCode')}</label>
              <div className="horizon-cart-coupon__row">
                <input
                  id="coupon"
                  type="text"
                  placeholder={t('cart.discountPlaceholder')}
                  className="horizon-cart-input"
                />
                <button type="button" className="horizon-cart-btn horizon-cart-btn--outline">
                  {t('cart.apply')}
                </button>
              </div>
            </div>

            <Link to="/products" className="horizon-cart-continue">
              <FiArrowLeft size={16} />
              {t('cart.continueShopping')}
            </Link>
          </div>

          <aside className="horizon-cart-summary">
            <h2>{t('cart.summary')}</h2>
            <div className="horizon-cart-summary__row">
              <span>{t('cart.subtotal')}</span>
              <strong>{formatPriceVND(subTotal)}</strong>
            </div>
            <div className="horizon-cart-summary__row">
              <span>{t('cart.shipping')}</span>
              <strong className="is-free">{t('cart.shippingFree')}</strong>
            </div>
            <div className="horizon-cart-summary__total">
              <span>{t('cart.total')}</span>
              <span>{formatPriceVND(subTotal)}</span>
            </div>
            <p className="horizon-cart-summary__note">
              {t('cart.taxesIncluded')}
            </p>
            <button
              type="button"
              className="horizon-cart-btn horizon-cart-btn--primary"
              onClick={() => navigate('/cart/checkout')}
            >
              {t('cart.checkout')}
            </button>
            <p className="horizon-cart-summary__secure">
              <FiLock size={14} aria-hidden />
              {t('cart.secureCheckout')}
            </p>
          </aside>
        </div>
      </div>

      {modalOpen && (
        <>
          <button
            type="button"
            className="horizon-cart-modal-backdrop"
            aria-label={t('common.close')}
            onClick={() => setModalOpen(false)}
          />
          <div className="horizon-cart-modal" role="dialog" aria-modal="true">
            <h3>{t('cart.removeItemTitle')}</h3>
            <p>{t('cart.removeItemDescription')}</p>
            <div className="horizon-cart-modal__actions">
              <button
                type="button"
                className="horizon-cart-btn horizon-cart-btn--outline"
                onClick={() => setModalOpen(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="horizon-cart-btn horizon-cart-btn--danger"
                onClick={onDeleteItem}
              >
                {t('common.remove')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
