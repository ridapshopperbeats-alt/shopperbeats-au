'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authApi } from './apis/auth-api';
import { setAccessToken } from './slices/auth-slice';
import { getAccessTokenCookie } from '@/lib/utils/access-token';
import TokenRefreshManager from '@/components/TokenRefreshManager';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cookieAccessToken = getAccessTokenCookie();
    if (cookieAccessToken) {
      store.dispatch(setAccessToken(cookieAccessToken));
    }
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
