import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";
import { logout, syncAuthState, setAccessToken } from '../slices/auth-slice';
import { clearCart } from '../slices/cart-slice';
import { UserDetails, PersonalData, LoginResponse, UpdatePersonalDataRequest, SocialMediaLink } from "@/types/auth";

import { addressApi } from "./address-api";
import { cartApi } from "./cart-api";
import { orderApi } from "./order-api";
import { createBaseQuery } from "./base-query";

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
          if (typeof window !== "undefined") {
            localStorage.setItem("isAuthenticated", "true");
          }
          const token = data?.response?.access_token;
          if (token) {
            dispatch(setAccessToken(token));
          } else {
            dispatch(setAccessToken(null));
          }
          dispatch(syncAuthState());
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
          const token = data?.response?.access_token;
          if (token) {
            if (typeof window !== "undefined") {
              localStorage.setItem("isAuthenticated", "true");
            }
            dispatch(setAccessToken(token));
            dispatch(syncAuthState());
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
          console.error("Logout request failed", err);
        } finally {
          dispatch(clearCart());
          dispatch(authApi.util.resetApiState());
          dispatch(addressApi.util.resetApiState());
          dispatch(cartApi.util.resetApiState());
          dispatch(orderApi.util.resetApiState());
          dispatch(logout());
        }
      },
    }),

    getUserDetails: builder.query<UserDetails, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.USER_DETAILS,
      }),
      providesTags: ["User"],
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
            if (typeof window !== "undefined") {
              localStorage.setItem("isAuthenticated", "true");
            }
            dispatch(setAccessToken(data.access_token));
            dispatch(syncAuthState());
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
          if (typeof window !== "undefined") {
            localStorage.setItem("isAuthenticated", "true");
          }
          const token = data?.response?.access_token;
          if (token) {
            dispatch(setAccessToken(token));
          }
          dispatch(syncAuthState());
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
