import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AnalyticsService } from '../services/analytics.service.js';
import { AnalyticsQuery } from '../validations/analytics.validation.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getAggregates(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = this.parseFilters(req.query as AnalyticsQuery);
      const data = await analyticsService.getAggregates(filters);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChartData(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = this.parseFilters(req.query as AnalyticsQuery);
      const data = await analyticsService.getChartData(filters);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaginatedData(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, ...filters } = this.parseFilters(req.query as AnalyticsQuery);
      const data = await analyticsService.getPaginatedData({
        ...filters,
        page,
        limit,
      });
      
      res.status(StatusCodes.OK).json({
        success: true,
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await analyticsService.getById(id);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  private parseFilters(query: AnalyticsQuery) {
    const filters: any = {};

    if (query.startDate) {
      filters.startDate = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.endDate = new Date(query.endDate);
    }
    if (query.region) {
      filters.region = query.region;
    }
    if (query.category) {
      filters.category = query.category;
    }
    if (query.source) {
      filters.source = query.source;
    }
    if (query.page) {
      filters.page = query.page;
    }
    if (query.limit) {
      filters.limit = query.limit;
    }

    return filters;
  }
}