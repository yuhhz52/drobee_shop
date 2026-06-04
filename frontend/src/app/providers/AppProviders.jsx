import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import store from '@app/store';
import { router } from '@app/router';
import ErrorBoundary from '@shared/components/ErrorBoundary/ErrorBoundary.jsx';

const AppProviders = () => (
  <Provider store={store}>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </Provider>
);

export default AppProviders;
