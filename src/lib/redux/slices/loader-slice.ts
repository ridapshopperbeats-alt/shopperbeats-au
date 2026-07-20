"use client";

import { createSlice } from "@reduxjs/toolkit";

const loaderSlice = createSlice({
  name: "loader",
  initialState: {
    count: 0,
  },
  reducers: {
    pushLoader: (state) => {
      state.count += 1;
    },
    popLoader: (state) => {
      state.count = Math.max(0, state.count - 1);
    },
  },
});

export const { pushLoader, popLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
