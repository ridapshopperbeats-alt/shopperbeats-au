import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";

import { UserDetails, PersonalData, LoginResponse, UpdatePersonalDataRequest, SocialMediaLink } from "@/types/auth";
import { createBaseQuery } from "./base-query";
import { logout, setAuthenticated, setAccessToken } from "../slices/auth-slice";
import { clearRefreshToken, setRefreshToken } from "@/lib/utils/refresh-token-cokkie";
import { clearAccessTokenCookie, setAccessTokenCookie } from "@/lib/utils/access-token";
import { clearCart } from "../slices/cart-slice";
import { addressApi } from "./address-api";
import { cartApi } from "./cart-api";
import { orderApi } from "./order-api";
import { paymentApi } from "./payment-api";
import { vendorApi } from "./vendor-api";

const baseQuery = createBaseQuery(API_ENDPOINTS.AUTH.BASE_URL);

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["User", "PersonalData"],
  endpoints: (builder) => ({
    login: builder.mutation<
      LoginResponse,
      {
        email: string;
        password: string;
        recaptcha_token: string;
        remember_me?: boolean;
      }
    >({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthenticated(true));
          if (data?.response?.access_token) {
            dispatch(setAccessToken(data.response.access_token));
            setAccessTokenCookie(data.response.access_token);
          }
          if (data?.response?.refresh_token) {
            setRefreshToken(data.response.refresh_token);
          }
        } catch {}
      },
    }),
    signup: builder.mutation<
      LoginResponse,
      {
        password2: string;
        email: string;
        password: string;
        recaptcha_token: string;
        mailing_list?: boolean;
      }
    >({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.SIGNUP,
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.response?.access_token) {
            dispatch(setAuthenticated(true));
            dispatch(setAccessToken(data.response.access_token));
            setAccessTokenCookie(data.response.access_token);
          }
          if (data?.response?.refresh_token) {
            setRefreshToken(data.response.refresh_token);
          }
        } catch {}
      },
    }),
    forgotPassword: builder.mutation<
      { message: string },
      { email_address: string }
    >({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        method: "POST",
        body: credentials,
      }),
    }),
    resetPassword: builder.mutation<
      { message: string },
      {
        password2: string;
        password1: string;
        uid: string;
        token: string;
        recaptcha_token: string;
      }
    >({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          // The server call can fail (e.g. an already-expired session
          // returns 401) but the user still asked to log out, so the
          // local session is cleared regardless below.
          // The local session is cleared regardless (see finally below), so
          // this isn't fatal — avoid tripping Next's console.error dev overlay.
          console.warn("Logout request failed; clearing local session anyway, status:", (err as { status?: number | string })?.status);
        } finally {
          clearRefreshToken();
          clearAccessTokenCookie();
          dispatch(clearCart());
          dispatch(authApi.util.resetApiState());
          dispatch(addressApi.util.resetApiState());
          dispatch(cartApi.util.resetApiState());
          dispatch(orderApi.util.resetApiState());
          dispatch(paymentApi.util.resetApiState());
          dispatch(vendorApi.util.resetApiState());
          dispatch(logout());
        }
      },
    }),

    getUserDetails: builder.query<UserDetails, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.USER_DETAILS,
      }),
      providesTags: ["User"],
      // This is also the app's sole session check (see StoreProvider): the
      // cookie session is HttpOnly and can't be read from JS, so whether
      // this call succeeds or fails IS the source of truth for
      // `state.auth.isAuthenticated`, instead of a client-writable flag.
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(setAuthenticated(true));
        } catch (err) {
          // Only a definitive 401/403 (or a session base-query already gave
          // up on, i.e. tokens were cleared) means the user is actually
          // logged out. A transient failure (network blip, 5xx, timeout)
          // isn't proof of that — flipping isAuthenticated to false here
          // would hide the user's data even though their session is fine.
          const status = (err as { error?: { status?: number | string } })?.error?.status;
          if (status === 401 || status === 403) {
            dispatch(setAuthenticated(false));
          }
        }
      },
    }),
    updateUserDetails: builder.mutation<UserDetails, Partial<UserDetails>>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.USER_DETAILS,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    verifyEmail: builder.mutation<{ message: string; access_token?: string; refresh_token?: string; user?: UserDetails }, { token: string }>({
      query: ({ token }) => ({
        url: API_ENDPOINTS.AUTH.VERIFY_EMAIL(token).replace(
          API_ENDPOINTS.AUTH.BASE_URL + "/",
          ""
        ),
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.access_token) {
            dispatch(setAuthenticated(true));
            dispatch(setAccessToken(data.access_token));
            setAccessTokenCookie(data.access_token);
          }
          if (data?.refresh_token) {
            setRefreshToken(data.refresh_token);
          }
        } catch {}
      },
    }),
    getPersonalData: builder.query<PersonalData, void>({
      query: () => API_ENDPOINTS.AUTH.PERSONAL_DATA,
      providesTags: ["PersonalData"],
    }),
    updatePersonalData: builder.mutation<
      PersonalData,
      UpdatePersonalDataRequest | FormData
    >({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.PERSONAL_DATA,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PersonalData"],
    }),

    changePassword: builder.mutation<
      { message: string },
      { current_password: string; new_password: string }
    >({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        method: "POST",
        body: credentials,
      }),
    }),
    resendVerificationCode: builder.mutation<
      { message: string },
      { email: string }
    >({
      query: (body) => ({
        url: "resend-verification-code",
        method: "POST",
        body,
      }),
    }),
    googleLogin: builder.mutation<LoginResponse, { access_token: string }>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthenticated(true));
          if (data?.response?.access_token) {
            dispatch(setAccessToken(data.response.access_token));
            setAccessTokenCookie(data.response.access_token);
          }
          if (data?.response?.refresh_token) {
            setRefreshToken(data.response.refresh_token);
          }
        } catch {}
      },
    }),
    getSocialMediaLinks: builder.query<SocialMediaLink[], void>({
      queryFn: async () => {
        try {
          const res = await fetch(API_ENDPOINTS.SOCIAL_MEDIA.GET_LINKS);
          const data = await res.json();
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetUserDetailsQuery,
  useUpdateUserDetailsMutation,
  useVerifyEmailMutation,
  useGetPersonalDataQuery,
  useUpdatePersonalDataMutation,
  useChangePasswordMutation,
  useResendVerificationCodeMutation,
  useGoogleLoginMutation,
  useGetSocialMediaLinksQuery,
} = authApi;


