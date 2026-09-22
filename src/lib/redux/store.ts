import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { highlightsApi, productsApi } from "./apis/products-api";
import { authApi } from "./apis/auth-api";
import { cartApi } from "./apis/cart-api";

import { orderApi } from "./apis/order-api";
import { addressApi } from "./apis/address-api";
import { helpdeskApi } from "./apis/helpdesk-api";
import { paymentApi } from "./apis/payment-api";
import { marketingApi } from "./apis/marketing-api";
import { vendorApi } from "./apis/vendor-api";
import { faqApi } from "./apis/faq-api";
import { geocodeApi } from "./apis/geocode-api";
import authReducer from "./slices/auth-slice";
import cartReducer from "./slices/cart-slice";
import breadcrumbReducer from "./slices/breadcrumb-slice";
import loaderReducer from "./slices/loader-slice";
import postcodeReducer from "./slices/postcode-slice";

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  breadcrumb: breadcrumbReducer,
  loader: loaderReducer,
  postcode: postcodeReducer,
  [productsApi.reducerPath]: productsApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [highlightsApi.reducerPath]: highlightsApi.reducer,

  [orderApi.reducerPath]: orderApi.reducer,
  [helpdeskApi.reducerPath]: helpdeskApi.reducer,
  [addressApi.reducerPath]: addressApi.reducer,
  [marketingApi.reducerPath]: marketingApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [vendorApi.reducerPath]: vendorApi.reducer,
  [faqApi.reducerPath]: faqApi.reducer,
  [geocodeApi.reducerPath]: geocodeApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
        immutableCheck: { warnAfter: 256 },
      }).concat(
        productsApi.middleware,
        authApi.middleware,
        cartApi.middleware,
        highlightsApi.middleware,
        orderApi.middleware,
        helpdeskApi.middleware,
        addressApi.middleware,
        marketingApi.middleware,
        paymentApi.middleware,
        vendorApi.middleware,
        faqApi.middleware,
        geocodeApi.middleware
      ),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export const store = makeStore();