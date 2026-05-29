import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiLock } from 'react-icons/fi';
import { selectCartItems } from '@app/store/slices/cart.jsx';
import {
  delteItemFromCartAction,
  updateItemCartAction,
} from '@app/store/actions/cartAction';
import { formatPriceEUR } from '@shared/utils/price-format';
import { inferBrandFromProduct } from '@shared/utils/product-brand';
import EmptyCart from '@assets/images/empty-cart.png';
import './Cart.css';

const CartQty = ({ quantity, onChange, onRemove }) => (
  <div className="vepace-cart-qty">
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
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState({});

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
    (value, productId, variantId) => {
      dispatch(
        updateItemCartAction({
          productId,
          variant_id: variantId,
          quantity: value,
        })
      );
    },
    [dispatch]
  );

  const onDeleteProduct = useCallback((productId, variantId) => {
    setDeleteItem({ productId, variantId });
    setModalOpen(true);
  }, []);

  const onDeleteItem = useCallback(() => {
    dispatch(delteItemFromCartAction(deleteItem));
    setModalOpen(false);
    setDeleteItem({});
  }, [deleteItem, dispatch]);

  if (!cartItems?.length) {
    return (
      <div className="vepace-cart-page">
        <div className="vepace-cart-page__header">
          <div className="vepace-cart-page__container">
            <nav className="vepace-cart-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Cart</span>
            </nav>
            <h1>Your cart</h1>
          </div>
        </div>
        <div className="vepace-cart-page__container">
          <div className="vepace-cart-empty">
            <img src={EmptyCart} alt="" />
            <h2>Your cart is empty</h2>
            <p>Shop our electric scooters and add your favourite ride.</p>
            <Link to="/products" className="vepace-cart-btn vepace-cart-btn--primary">
              Explore Our Scooters
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vepace-cart-page">
      <div className="vepace-cart-page__header">
        <div className="vepace-cart-page__container">
          <nav className="vepace-cart-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Cart</span>
          </nav>
          <h1>
            Your cart
            <span className="vepace-cart-page__count">
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </h1>
        </div>
      </div>

      <div className="vepace-cart-page__container">
        <div className="vepace-cart-layout">
          <div className="vepace-cart-main">
            <div className="vepace-cart-table-head">
              <span>Product</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>

            <ul className="vepace-cart-items">
              {cartItems.map((item, index) => (
                <li
                  key={`${item.productId}-${item.variant?.id || index}`}
                  className="vepace-cart-item"
                >
                  <div className="vepace-cart-item__product">
                    <Link
                      to={`/product/${item.slug || item.productId}`}
                      className="vepace-cart-item__image"
                    >
                      <img src={item.thumbnail} alt="" />
                    </Link>
                    <div>
                      {inferBrandFromProduct(item) && (
                        <p className="vepace-cart-item__brand">
                          {inferBrandFromProduct(item)}
                        </p>
                      )}
                      <h3>
                        <Link to={`/product/${item.slug || item.productId}`}>
                          {item.name}
                        </Link>
                      </h3>
                      <p className="vepace-cart-item__meta">
                        {item.variant?.variantName && (
                          <span>Version: {item.variant.variantName}</span>
                        )}
                        {item.variant?.color && (
                          <span> · {item.variant.color}</span>
                        )}
                      </p>
                      <p className="vepace-cart-item__unit">
                        {formatPriceEUR(item.price)} each
                      </p>
                    </div>
                  </div>

                  <div className="vepace-cart-item__qty-col">
                    <CartQty
                      quantity={item.quantity}
                      onChange={(v) =>
                        onChangeQuantity(v, item.productId, item.variant?.id)
                      }
                      onRemove={() =>
                        onDeleteProduct(item.productId, item.variant?.id)
                      }
                    />
                    <button
                      type="button"
                      className="vepace-cart-item__remove"
                      onClick={() =>
                        onDeleteProduct(item.productId, item.variant?.id)
                      }
                      aria-label="Remove"
                    >
                      <FiTrash2 size={16} />
                      Remove
                    </button>
                  </div>

                  <div className="vepace-cart-item__total">
                    {formatPriceEUR(item.subTotal)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="vepace-cart-coupon">
              <label htmlFor="coupon">Discount code</label>
              <div className="vepace-cart-coupon__row">
                <input
                  id="coupon"
                  type="text"
                  placeholder="e.g. VEPACE"
                  className="vepace-cart-input"
                />
                <button type="button" className="vepace-cart-btn vepace-cart-btn--outline">
                  Apply
                </button>
              </div>
            </div>

            <Link to="/products" className="vepace-cart-continue">
              <FiArrowLeft size={16} />
              Continue shopping
            </Link>
          </div>

          <aside className="vepace-cart-summary">
            <h2>Order summary</h2>
            <div className="vepace-cart-summary__row">
              <span>Subtotal</span>
              <strong>{formatPriceEUR(subTotal)}</strong>
            </div>
            <div className="vepace-cart-summary__row">
              <span>Shipping</span>
              <strong className="is-free">Free (EU)</strong>
            </div>
            <div className="vepace-cart-summary__total">
              <span>Total</span>
              <span>{formatPriceEUR(subTotal)}</span>
            </div>
            <p className="vepace-cart-summary__note">
              Taxes included. Free helmet offer applied at checkout when eligible.
            </p>
            <button
              type="button"
              className="vepace-cart-btn vepace-cart-btn--primary"
              onClick={() => navigate('/checkout')}
            >
              Proceed to checkout
            </button>
            <button type="button" className="vepace-cart-btn vepace-cart-btn--paypal">
              Pay with PayPal
            </button>
            <p className="vepace-cart-summary__secure">
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
            className="vepace-cart-modal-backdrop"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
          />
          <div className="vepace-cart-modal" role="dialog" aria-modal="true">
            <h3>Remove item?</h3>
            <p>This product will be removed from your cart.</p>
            <div className="vepace-cart-modal__actions">
              <button
                type="button"
                className="vepace-cart-btn vepace-cart-btn--outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="vepace-cart-btn vepace-cart-btn--danger"
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
