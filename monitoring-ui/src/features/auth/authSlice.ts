import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

type UserInfo = {
  userId: string;
  username: string;
  email: string;
  enabled: boolean;
}

type AuthState = {
  token: string | null;
  userInfo: UserInfo | null;
  expiration: number | null;
  isAuthenticated: boolean;
}

const decodeToken = (token: string): { userInfo: UserInfo; expiration: number } => {
  const decoded = jwtDecode<{
    userId: string;
    username: string;
    email: string;
    enabled: boolean;
    exp: number;  
  }>(token);

  return {
    userInfo: {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      enabled: decoded.enabled,
    },
    expiration: decoded.exp * 1000,
  };
};

const initialState: AuthState = {
  token: null,
  userInfo: null,
  expiration: null,
  isAuthenticated: false,
}

const getStoredAuthSession = (): AuthState => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return initialState;

    const { userInfo, expiration } = decodeToken(token);

    if (Date.now() > expiration) {
      localStorage.removeItem("token");
      return initialState;
    }

    return {
      token: token || null,
      userInfo: userInfo || null,
      expiration: expiration || null,
      isAuthenticated: true,
    };
  } catch {
    return initialState;
  }
}

const parsedSession = getStoredAuthSession();

const authSlice = createSlice({
  name: "auth",
  initialState: parsedSession,
  reducers: {
    setAuthSession: (state, action) => {
      const { token } = action.payload;
      const { userInfo, expiration } = decodeToken(token);

      state.token = token;
      state.userInfo = userInfo;
      state.expiration = expiration;
      state.isAuthenticated = true;

      localStorage.setItem("token", token);
    },

    clearAuth: (state) => {
      state.token = null;
      state.userInfo = null;
      state.expiration = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
    },
  },
});

export const {
  setAuthSession,
  clearAuth
} = authSlice.actions;

export default authSlice.reducer;