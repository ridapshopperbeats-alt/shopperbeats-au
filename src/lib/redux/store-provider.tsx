'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authApi } from './apis/auth-api';
import TokenRefreshManager from '@/components/TokenRefreshManager';
import { syncRefreshTokenCookie } from '@/lib/utils/refresh-token-store';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sessions that signed in before the refresh_token cookie existed only have
    // the token in localStorage, and the /user/* guard cannot see that.
    syncRefreshTokenCookie();

    store.dispatch(authApi.endpoints.getUserDetails.initiate());
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-sync') {
        store.dispatch(
          authApi.endpoints.getUserDetails.initiate(undefined, {
            forceRefetch: true,
          })
        );
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return <Provider store={store}>{children}<TokenRefreshManager /><ToastContainer
    position="top-right"
    autoClose={4000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    theme="dark"
  />
  </Provider>;
}
