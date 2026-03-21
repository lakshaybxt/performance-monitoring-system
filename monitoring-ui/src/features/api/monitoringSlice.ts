import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery } from "./graphqlBaseQuery";
import { gql } from "graphql-request";

type Metrics = {
  cpuUsage:     number;
  memoryUsage:  number;
  responseTime: number;
  threadCount:  number;
  createdAt:    string;
};

type Alert = {
  alertType: string;
  severity:  string;
  message:   string;
  createdAt: string;
  resolved:  boolean;
};

type MetricsArgs = {
  applicationId: string;
  minutes:       number;
};

type AlertsArgs = {
  applicationId: string;
  limit?:        number;
  offset?:       number;
};

export const monotoringApi = createApi({
  reducerPath: "monitoringApi",

  baseQuery: graphqlBaseQuery({
    baseUrl: "http://localhost:8080/graphql", 
  }),

  endpoints: (builder) => ({

    getMetrics: builder.query<Metrics[], MetricsArgs>({
      query: ({ applicationId, minutes }) => ({
        body:  {
          query: gql`
            query GetMetrics($applicationId: ID!, $minutes: Int!) {
              metrics(applicationId: $applicationId, minutes: $minutes) {
                cpuUsage
                memoryUsage
                responseTime
                threadCount
                createdAt
              }
            }
          `,
          variables: { applicationId, minutes },
        },
      }),
      transformResponse: (response: { metrics: Metrics[] }) => response.metrics,
    }),

    getAlerts: builder.query<Alert[], AlertsArgs>({
      query: ({ applicationId, limit = 20, offset = 0 }) => ({
        body: {
          query: gql`
            query GetAlerts($applicationId: ID!, $limit: Int, $offset: Int) {
              alerts(applicationId: $applicationId, limit: $limit, offset: $offset) {
                alertType
                severity
                message
                createdAt
                resolved
              }
            }
          `,
          variables: { applicationId, limit, offset },
        }
      }),
      transformResponse: (response: { alerts: Alert[] }) => response.alerts,
    }), 
  }),

});

export const {
  useGetMetricsQuery,
  useGetAlertsQuery
} = monotoringApi;