import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { Provider } from 'react-redux'
import store from './store/store.jsx'


createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} >
      <App />
      </RouterProvider>
    </Provider>
  // </StrictMode>,
)
