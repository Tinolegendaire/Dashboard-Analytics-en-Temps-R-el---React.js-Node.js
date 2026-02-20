export interface Analytics {
  id: string
  timestamp: string
  revenue: number
  users: number
  sessions: number
  bounceRate: number
  conversion: number
  region: string
  category: string
  source: string
}

export interface AnalyticsAggregate {
  totalRevenue: number
  totalUsers: number
  totalSessions: number
  avgBounceRate: number
  avgConversion: number
  uniqueRegions: number
  uniqueCategories: number
  uniqueSources: number
}

export interface ChartDataPoint {
  date: string
  revenue: number
  users: number
  sessions: number
  bounceRate: number
  conversion: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface FilterState {
  dateRange: 'today' | '7d' | '30d' | 'custom'
  customStartDate?: string
  customEndDate?: string
  region?: string
  category?: string
  source?: string
}

export interface WebSocketEvent {
  type: 'new_user' | 'new_sale' | 'traffic_spike'
  data: any
  timestamp: string
}

export type Theme = 'light' | 'dark'

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
}