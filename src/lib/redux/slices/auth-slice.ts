import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "@/types/auth";

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  authChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.authChecked = true;
      if (typeof window !== "undefined") {
        // Non-sensitive ping only (no token/flag value) so other open tabs
        // know to re-check their session with the backend.
        localStorage.setItem("auth-sync", Date.now().toString());
      }
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      state.authChecked = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth-sync", Date.now().toString());
      }
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
  },
});

export const { logout, setAuthenticated, setAccessToken } = authSlice.actions;
export default authSlice.reducer;


