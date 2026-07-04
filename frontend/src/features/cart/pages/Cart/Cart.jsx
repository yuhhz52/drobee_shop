import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiLock } from 'react-icons/fi';
import { selectCartItems } from '@app/store/slices/cart.jsx';
import {
  updateCartItem,
  removeCartItem,
  clearCart,
} from '@app/store/actions/cartAction';
import { formatPriceVND } from '@shared/utils/price-format';
import { inferBrandFromProduct } from '@shared/utils/product-brand';
import EmptyCart from '@assets/images/empty-cart.png';
import './Cart.css';

const CartQty = ({ quantity, onChange, onRemove }) => (
  <div className="horizon-cart-qty">
    <button
      type="button"
      onClick={() => (quantity <= 1 ? onRemove() : onChange(quantity - 1))}
      aria-label="Decrease"
    >
      −
    </button>
    <span>{quantity}</span>
    <button type="button" onClick={() => onChange(quantity + 1)} aria-label="Increase">
      +
    </button>
  </div>
);

const Cart = () => {
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
            <nav className="horizon-cart-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Cart</span>
            </nav>
            <h1>Your cart</h1>
          </div>
        </div>
        <div className="horizon-cart-page__container">
          <div className="horizon-cart-empty">
            <img src={EmptyCart} alt="" />
            <h2>Your cart is empty</h2>
            <p>Shop our electric scooters and add your favourite ride.</p>
            <Link to="/products" className="horizon-cart-btn horizon-cart-btn--primary">
              Explore Our Scooters
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
          <nav className="horizon-cart-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Cart</span>
          </nav>
          <h1>
            Your cart
            <span className="horizon-cart-page__count">
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </h1>
        </div>
      </div>

      <div className="horizon-cart-page__container">
        <div className="horizon-cart-layout">
          <div className="horizon-cart-main">
            <div className="horizon-cart-table-head">
              <span>Product</span>
              <span>Quantity</span>
              <span>Total</span>
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
                          <span>Version: {item.variantName}</span>
                        )}
                        {item.variantColor && (
                          <span> · {item.variantColor}</span>
                        )}
                      </p>
                      <p className="horizon-cart-item__unit">
                        {formatPriceVND(item.unitPrice)} each
                      </p>
                    </div>
                  </div>

                  <div className="horizon-cart-item__qty-col">
                    <CartQty
                      quantity={item.quantity}
                      onChange={(v) => onChangeQuantity(v, itemKey)}
                      onRemove={() => onDeleteProduct(itemKey)}
                    />
                    <button
                      type="button"
                      className="horizon-cart-item__remove"
                      onClick={() => onDeleteProduct(itemKey)}
                      aria-label="Remove"
                    >
                      <FiTrash2 size={16} />
                      Remove
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
              <label htmlFor="coupon">Discount code</label>
              <div className="horizon-cart-coupon__row">
                <input
                  id="coupon"
                  type="text"
                  placeholder="e.g. HORIZON"
                  className="horizon-cart-input"
                />
                <button type="button" className="horizon-cart-btn horizon-cart-btn--outline">
                  Apply
                </button>
              </div>
            </div>

            <Link to="/products" className="horizon-cart-continue">
              <FiArrowLeft size={16} />
              Continue shopping
            </Link>
          </div>

          <aside className="horizon-cart-summary">
            <h2>Order summary</h2>
            <div className="horizon-cart-summary__row">
              <span>Subtotal</span>
              <strong>{formatPriceVND(subTotal)}</strong>
            </div>
            <div className="horizon-cart-summary__row">
              <span>Shipping</span>
              <strong className="is-free">Free (EU)</strong>
            </div>
            <div className="horizon-cart-summary__total">
              <span>Total</span>
              <span>{formatPriceVND(subTotal)}</span>
            </div>
            <p className="horizon-cart-summary__note">
              Taxes included. Free helmet offer applied at checkout when eligible.
            </p>
            <button
              type="button"
              className="horizon-cart-btn horizon-cart-btn--primary"
              onClick={() => navigate('/cart/checkout')}
            >
              Proceed to checkout
            </button>
            <p className="horizon-cart-summary__secure">
              <FiLock size={14} aria-hidden />
              Secure checkout · 100% protected
            </p>
          </aside>
        </div>
      </div>

      {modalOpen && (
        <>
          <button
            type="button"
            className="horizon-cart-modal-backdrop"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
          />
          <div className="horizon-cart-modal" role="dialog" aria-modal="true">
            <h3>Remove item?</h3>
            <p>This product will be removed from your cart.</p>
            <div className="horizon-cart-modal__actions">
              <button
                type="button"
                className="horizon-cart-btn horizon-cart-btn--outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="horizon-cart-btn horizon-cart-btn--danger"
                onClick={onDeleteItem}
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
