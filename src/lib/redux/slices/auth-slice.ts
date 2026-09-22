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
      const wasAuthenticated = state.isAuthenticated;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.authChecked = true;
    
      if (wasAuthenticated && typeof window !== "undefined") {
        localStorage.setItem("auth-sync", Date.now().toString());
      }
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      const changed = state.isAuthenticated !== action.payload;
      state.isAuthenticated = action.payload;
      state.authChecked = true;
      if (changed && typeof window !== "undefined") {
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


