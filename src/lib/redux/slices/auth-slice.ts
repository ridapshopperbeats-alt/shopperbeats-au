import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "@/types/auth";

const ACCESS_TOKEN_KEY = "accessToken";

// Always start unauthenticated so the initial client render matches the
// server-rendered HTML; the real value is applied via syncAuthState()
// after mount (see StoreProvider), avoiding a hydration mismatch.
const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    },
    syncAuthState: (state) => {
      if (typeof window !== "undefined") {
        state.isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        state.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      }
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem(ACCESS_TOKEN_KEY, action.payload);
        } else {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      }
    },
  },
});

export const { logout, syncAuthState, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
