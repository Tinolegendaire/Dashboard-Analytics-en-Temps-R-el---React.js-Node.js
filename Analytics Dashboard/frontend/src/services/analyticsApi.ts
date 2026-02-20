import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Analytics, AnalyticsAggregate, ChartDataPoint, PaginatedResponse, FilterState } from '@/types'

// Helper to convert filters to query params
const filtersToParams = (filters: FilterState) => {
  const params: Record<string, string> = {}
  
  if (filters.dateRange === 'custom') {
    if (filters.customStartDate) params.startDate = filters.customStartDate
    if (filters.customEndDate) params.endDate = filters.customEndDate
  } else {
    const now = new Date()
    const endDate = now.toISOString()
    let startDate: Date
    
    switch (filters.dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30))
        break
      default:
        startDate = new Date(now.setDate(now.getDate() - 30))
    }
    
    params.startDate = startDate.toISOString()
    params.endDate = endDate
  }
  
  if (filters.region && filters.region !== 'all') params.region = filters.region
  if (filters.category && filters.category !== 'all') params.category = filters.category
  if (filters.source && filters.source !== 'all') params.source = filters.source
  
  return params
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getAggregates: builder.query<AnalyticsAggregate, FilterState>({
      query: (filters) => ({
        url: '/analytics/aggregates',
        params: filtersToParams(filters),
      }),
      providesTags: ['Analytics'],
    }),
    
    getChartData: builder.query<ChartDataPoint[], FilterState>({
      query: (filters) => ({
        url: '/analytics/chart',
        params: filtersToParams(filters),
      }),
      providesTags: ['Analytics'],
    }),
    
    getAnalytics: builder.query<PaginatedResponse<Analytics>, FilterState & { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20, ...filters }) => ({
        url: '/analytics',
        params: {
          page,
          limit,
          ...filtersToParams(filters as FilterState),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Analytics' as const, id })),
              { type: 'Analytics', id: 'PARTIAL-LIST' },
            ]
          : [{ type: 'Analytics', id: 'PARTIAL-LIST' }],
    }),
    
    getAnalyticsById: builder.query<Analytics, string>({
      query: (id) => `/analytics/${id}`,
      providesTags: (result, error, id) => [{ type: 'Analytics', id }],
    }),
  }),
})

export const {
  useGetAggregatesQuery,
  useGetChartDataQuery,
  useGetAnalyticsQuery,
  useGetAnalyticsByIdQuery,
} = analyticsApi