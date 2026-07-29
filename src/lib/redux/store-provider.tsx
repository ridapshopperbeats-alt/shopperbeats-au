'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authApi } from './apis/auth-api';
import { setAccessToken } from './slices/auth-slice';
import { getAccessTokenCookie } from '@/lib/utils/access-token';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // accessToken lives in memory (Redux), so a hard reload wipes it;
    // restore it from its JS-readable cookie before anything reads it off
    // state.auth, otherwise Bearer-authed calls go out with no token.
    const cookieAccessToken = getAccessTokenCookie();
    if (cookieAccessToken) {
      store.dispatch(setAccessToken(cookieAccessToken));
    }
    // The session lives in an HttpOnly cookie, invisible to JS, so this
    // request to the backend is the only way to know if the user is
    // actually logged in (see the onQueryStarted on getUserDetails).
    store.dispatch(authApi.endpoints.getUserDetails.initiate());
    const handleStorageChange = (e: StorageEvent) => {
      // "auth-sync" is a non-sensitive ping (no token/flag value) written by
      // authSlice whenever another tab's auth state changes; re-check here
      // so this tab's UI reflects login/logout that happened elsewhere.
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

  return <Provider store={store}>{children}<ToastContainer
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
