import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import store from '@app/store';
import { router } from '@app/router';
import ErrorBoundary from '@shared/components/ErrorBoundary/ErrorBoundary.jsx';
import I18nProvider from '@shared/i18n/I18nProvider.jsx';

const AppProviders = () => (
  <Provider store={store}>
    <I18nProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </I18nProvider>
  </Provider>
);

export default AppProviders;
