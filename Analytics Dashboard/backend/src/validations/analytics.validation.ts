import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    region: z.string().optional(),
    category: z.string().optional(),
    source: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const analyticsParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>['query'];