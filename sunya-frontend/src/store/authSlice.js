import { createSlice } from "@reduxjs/toolkit";

/**
 * authSlice
 *
 * AuthContext (src/context/AuthContext.jsx) remains the source of truth
 * for auth flow (it owns the access token lifecycle and talks to
 * axiosClient directly), since route guards need it synchronously via
 * plain React context. This slice mirrors the current user into Redux
 * so any connected component can read `state.auth.user` /
 * `state.auth.isAuthenticated` without prop-drilling — call
 * `setCredentials`/`clearCredentials` from AuthContext when its own
 * state changes to keep the two in sync.
 */
const initialState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload?.user ?? null;
      state.isAuthenticated = Boolean(state.user);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
