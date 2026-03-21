import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type LoginRequest = {
  email: string;
  password: string;
}

type RegisterRequest = {
  username: string;
  email: string;
  password: string;
}

type VerifyRequest = {
  email: string;
  verificationCode: string;
}

type LoginResponse = {
  token: string;
  expiration: number;
}

type AlertResponse = {
  id: string;
  applicationId: string;
  alertType: string;
  message: string;
  severity: string;
  resolved: boolean;
  createdAt: Date; 
}

type MetricResponse = {
  id:  string;
  applicationId: string;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  threadCount: number;
  createdAt: Date;
}

type ApplicationRegisterRequest = {
  name: string;
  baseUrl: string;
  email: string;
}

type ApplicationRegistrationResponse = {
  id: string;
  name: string;
  baseUrl: string;
  email: string;
}

export const apiSlice = createApi({
  reducerPath: "api",
  
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080",

    prepareHeaders: (headers , { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      if(token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  endpoints: (builder) => ({
    // ============= Auth Endpoints =============
    register: builder.mutation<void, RegisterRequest>({  
      query: (request) => ({                       
        url: "/auth/register",
        method: "POST",
        body: request,
      }),
    }),

    verifyUser: builder.mutation<string, VerifyRequest>({
      query: (request) => ({
        url: "/auth/verify",
        method: "POST",
        body: request,
        responseHandler: (response) => response.text(),
      }),
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (request) => ({
        url: "/auth/login",
        method: "POST",
        body: request,
      }),
    }),

    // ============= Metrics Endpoints =============
    getMetrics: builder.query<MetricResponse[], string>({
      query: (applicationId) => ({
        url: `/metrics/${applicationId}`,
        method: "GET",
      }),
    }),

    // ============= Metrics Endpoints =============
    getAlerts: builder.query<AlertResponse[], string>({
      query: (applicationId) => ({
        url: `/alerts/${applicationId}`,
        method: "GET",
      }),
    }),
    
    // ============= Application Endpoints =============
    registerApplication: builder.mutation<void, ApplicationRegisterRequest>({
      query: (request) => ({
        url: "/applications",
        method: "POST",
        body: request,
      }),
    }),

    getUserApplication: builder.query<ApplicationRegistrationResponse[], void>({
      query: () => ({
        url: `/applications`,
        method: "GET",
      }),
    }),

    getAllApplications: builder.query<ApplicationRegistrationResponse[], void>({
      query: () => ({
        url: "/applications/all",
        method: "GET",
      }),
    }),

    deleteApplication: builder.mutation<void, string>({
      query: (applicationId) => ({
        url: `/applications/${applicationId}`,
        method: "DELETE",
      })
    })
  }),
});

export const {
  useRegisterMutation,
  useVerifyUserMutation,
  useLoginMutation,

  useGetMetricsQuery,
  useGetAlertsQuery,

  useRegisterApplicationMutation,
  useGetUserApplicationQuery,
  useGetAllApplicationsQuery,
  useDeleteApplicationMutation,
} = apiSlice