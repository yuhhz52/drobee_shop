import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '@shared/components/Spinner/Spinner';
import '@shared/styles/AuthPages.css';

const AutheticationWrapper = () => {
  const isLoading = useSelector((state) => state.commonState.isLoading);

  return (
    <div className="vepace-auth-layout">
      <aside className="vepace-auth-brand">
        <div className="vepace-auth-brand__logo">VEPACE</div>
        <h2>Your Ride, Our Priority</h2>
        <p>
          Sign in to track orders, manage your account, and shop premium electric
          scooters across Europe.
        </p>
        <ul>
          <li>Free helmet with every scooter</li>
          <li>EU delivery 3–7 working days</li>
          <li>7/7 expert support</li>
          <li>Secure checkout</li>
        </ul>
        <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'underline' }}>
            ← Back to store
          </Link>
        </p>
      </aside>

      <div className="vepace-auth-panel">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="vepace-auth-mobile-logo">VEPACE</div>
          <Outlet />
        </div>
      </div>

      {isLoading && <Spinner />}
    </div>
  );
};

export default AutheticationWrapper;
