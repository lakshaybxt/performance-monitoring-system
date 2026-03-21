import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../features/api/apiSlice";
import { monotoringApi } from "../features/api/monitoringSlice";
import authReducer from "../features/auth/authSlice";

//the reducer is the storage, the middleware is the engine. Both are mandatory for RTK Query to work.
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    [monotoringApi.reducerPath]: monotoringApi.reducer,
  }, 

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(monotoringApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;