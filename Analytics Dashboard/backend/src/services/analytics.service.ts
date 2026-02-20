import { Prisma } from '@prisma/client';
import prisma from '../utils/prismaClient.js';
import { AnalyticsFilters, AnalyticsAggregate, ChartDataPoint } from '../types/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { StatusCodes } from 'http-status-codes';

export class AnalyticsService {
  async getAggregates(filters: AnalyticsFilters): Promise<AnalyticsAggregate> {
    const where = this.buildWhereClause(filters);

    const [
      totalRevenue,
      totalUsers,
      totalSessions,
      avgBounceRate,
      avgConversion,
      uniqueRegions,
      uniqueCategories,
      uniqueSources,
    ] = await Promise.all([
      prisma.analytics.aggregate({ where, _sum: { revenue: true } }),
      prisma.analytics.aggregate({ where, _sum: { users: true } }),
      prisma.analytics.aggregate({ where, _sum: { sessions: true } }),
      prisma.analytics.aggregate({ where, _avg: { bounceRate: true } }),
      prisma.analytics.aggregate({ where, _avg: { conversion: true } }),
      prisma.analytics.findMany({ where, distinct: ['region'], select: { region: true } }),
      prisma.analytics.findMany({ where, distinct: ['category'], select: { category: true } }),
      prisma.analytics.findMany({ where, distinct: ['source'], select: { source: true } }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.revenue || 0,
      totalUsers: totalUsers._sum.users || 0,
      totalSessions: totalSessions._sum.sessions || 0,
      avgBounceRate: avgBounceRate._avg.bounceRate || 0,
      avgConversion: avgConversion._avg.conversion || 0,
      uniqueRegions: uniqueRegions.length,
      uniqueCategories: uniqueCategories.length,
      uniqueSources: uniqueSources.length,
    };
  }

  async getChartData(filters: AnalyticsFilters): Promise<ChartDataPoint[]> {
    const where = this.buildWhereClause(filters);
    
    const results = await prisma.analytics.groupBy({
      by: ['timestamp'],
      where,
      _sum: {
        revenue: true,
        users: true,
        sessions: true,
      },
      _avg: {
        bounceRate: true,
        conversion: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return results.map(r => ({
      date: r.timestamp.toISOString().split('T')[0]!,
      revenue: r._sum.revenue || 0,
      users: r._sum.users || 0,
      sessions: r._sum.sessions || 0,
      bounceRate: r._avg.bounceRate || 0,
      conversion: r._avg.conversion || 0,
    }));
  }

  async getPaginatedData(filters: AnalyticsFilters & { page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [data, total] = await Promise.all([
      prisma.analytics.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.analytics.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const record = await prisma.analytics.findUnique({
      where: { id },
    });

    if (!record) {
      throw new AppError('Analytics record not found', StatusCodes.NOT_FOUND);
    }

    return record;
  }

  private buildWhereClause(filters: AnalyticsFilters): Prisma.AnalyticsWhereInput {
    const where: Prisma.AnalyticsWhereInput = {};

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    if (filters.region) {
      where.region = filters.region;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    return where;
  }
}