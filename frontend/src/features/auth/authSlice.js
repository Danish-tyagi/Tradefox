import { createSlice } from '@reduxjs/toolkit';

const stored = () => {
  try {
    const u = localStorage.getItem('tf_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored(),
    isAuthenticated: !!stored(),
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateBalance(state, action) {
      if (state.user) state.user.balance = action.payload;
    },
  },
});

export const { setUser, clearUser, updateBalance } = authSlice.actions;
export default authSlice.reducer;