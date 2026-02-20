import { Analytics } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsFilters extends Partial<DateRange> {
  region?: string;
  category?: string;
  source?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsAggregate {
  totalRevenue: number;
  totalUsers: number;
  totalSessions: number;
  avgBounceRate: number;
  avgConversion: number;
  uniqueRegions: number;
  uniqueCategories: number;
  uniqueSources: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  users: number;
  sessions: number;
  bounceRate: number;
  conversion: number;
}

export interface WebSocketEvent {
  type: 'new_user' | 'new_sale' | 'traffic_spike';
  data: any;
  timestamp: Date;
}