import React from 'react';
import { Link, isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

const AppRouteError = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const isRouteError = isRouteErrorResponse(error);

  const status = isRouteError ? error.status : 500;
  const title = isRouteError ? error.statusText : 'Unexpected error';
  const detail = isRouteError
    ? error.data?.message || error.data || 'The page you requested could not be found.'
    : 'Please try again or return to the homepage.';

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <p className="text-sm uppercase tracking-wide text-gray-500">Error {status}</p>
      <h1 className="mt-2 text-3xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-4 text-base text-gray-600">{detail}</p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Go back
        </button>
        <Link
          to="/"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Go home
        </Link>
      </div>
    </div>
  );
};

export default AppRouteError;

