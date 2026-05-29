import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutAPI } from '@services/auth.service';
import { clearTokens } from '@shared/utils/jwt-helper';
import '@shared/styles/AuthPages.css';

const Logouts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutAPI();
    } catch {
      clearTokens();
      window.location.href = '/';
    }
  };

  return (
    <div className="vepace-logout-page">
      <div className="vepace-auth-card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="vepace-auth-card__head">
          <h1>Sign out</h1>
          <p>Are you sure you want to log out of your VEPACE account?</p>
        </div>

        <div className="vepace-auth-actions">
          <button
            type="button"
            className="vepace-auth-submit vepace-auth-submit--red"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? 'Signing out…' : 'Yes, sign out'}
          </button>
          <button
            type="button"
            className="vepace-auth-submit vepace-auth-submit--outline"
            onClick={() => navigate('/account-details/profile')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        <p className="vepace-auth-footer" style={{ marginTop: '1.25rem' }}>
          <Link to="/">Return to homepage</Link>
        </p>
      </div>
    </div>
  );
};

export default Logouts;
