import React from 'react';
import { Link, isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { useTranslation } from '@shared/i18n/useTranslation.js';

const AppRouteError = () => {
  const { t } = useTranslation();
  const error = useRouteError();
  const navigate = useNavigate();
  const isRouteError = isRouteErrorResponse(error);

  const status = isRouteError ? error.status : 500;
  const fallbackTitle = isRouteError ? error.statusText : t('error.unexpected');
  const fallbackDetail = t('error.notFound');
  const genericDetail = t('error.tryAgain');

  const detail = isRouteError
    ? (typeof error.data === 'string'
        ? error.data
        : error.data?.message || error.statusText)
      || fallbackDetail
    : genericDetail;

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <p className="text-sm uppercase tracking-wide text-gray-500">{t('error.label', { status })}</p>
      <h1 className="mt-2 text-3xl font-semibold text-gray-900">{fallbackTitle}</h1>
      <p className="mt-4 text-base text-gray-600">{detail}</p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          {t('error.goBack')}
        </button>
        <Link
          to="/"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          {t('error.goHome')}
        </Link>
      </div>
    </div>
  );
};

export default AppRouteError;

