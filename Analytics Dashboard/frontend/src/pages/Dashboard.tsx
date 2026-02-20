import React, { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import {
  useGetAggregatesQuery,
  useGetChartDataQuery,
  useGetAnalyticsQuery,
} from '@/services/analyticsApi'
import { FilterBar } from '@/components/filters/FilterBar'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { KPICard } from '@/components/dashboard/KPICard'
import { DataTable } from '@/components/table/DataTable'
import { AlertBanner } from '@/components/alerts/AlertBanner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterState } from '@/types'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { ExportUtils } from '@/lib/exportUtils'
import {
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  Globe,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Lazy load charts for better performance
const RevenueChart = lazy(() => import('@/components/charts/RevenueChart').then(m => ({ default: m.RevenueChart })))
const UsersChart = lazy(() => import('@/components/charts/UsersChart').then(m => ({ default: m.UsersChart })))
const SessionsChart = lazy(() => import('@/components/charts/SessionsChart').then(m => ({ default: m.SessionsChart })))
const ConversionChart = lazy(() => import('@/components/charts/ConversionChart').then(m => ({ default: m.ConversionChart })))

export const Dashboard = () => {
  const [filters, setFilters] = useState<FilterState>({ dateRange: '30d' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [alerts, setAlerts] = useState<Array<{ type: 'revenue' | 'conversion' | 'bounce'; message: string; id: string }>>([])
  
  const user = useAppSelector((state) => state.auth.user)

  // RTK Queries with polling every 30 seconds
  const { data: aggregates, isLoading: aggregatesLoading } = useGetAggregatesQuery(filters, {
    pollingInterval: 30000,
  })
  
  const { data: chartData, isLoading: chartLoading } = useGetChartDataQuery(filters, {
    pollingInterval: 30000,
  })
  
  const { data: paginatedData, isLoading: tableLoading } = useGetAnalyticsQuery(
    { ...filters, page, limit },
    { pollingInterval: 30000 }
  )

  // Alert checking
  useEffect(() => {
    if (!aggregates) return

    const newAlerts = []

    // Revenue < 80% of average (simulated)
    if (aggregates.totalRevenue < 500000) {
      newAlerts.push({
        type: 'revenue' as const,
        message: 'Revenue is below target! Current: ' + formatCurrency(aggregates.totalRevenue),
        id: 'revenue-' + Date.now(),
      })
    }

    // Conversion < 2%
    if (aggregates.avgConversion < 2) {
      newAlerts.push({
        type: 'conversion' as const,
        message: `Conversion rate is critically low: ${formatPercentage(aggregates.avgConversion)}`,
        id: 'conversion-' + Date.now(),
      })
    }

    // Bounce > 60%
    if (aggregates.avgBounceRate > 60) {
      newAlerts.push({
        type: 'bounce' as const,
        message: `High bounce rate detected: ${formatPercentage(aggregates.avgBounceRate)}`,
        id: 'bounce-' + Date.now(),
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 5))
    }
  }, [aggregates])

  const handleRemoveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  const handleExport = useCallback((format: 'csv' | 'excel' | 'pdf') => {
    if (!paginatedData?.data) return

    const columns = [
      { header: 'Date', dataKey: 'timestamp' },
      { header: 'Revenue', dataKey: 'revenue' },
      { header: 'Users', dataKey: 'users' },
      { header: 'Sessions', dataKey: 'sessions' },
      { header: 'Bounce Rate', dataKey: 'bounceRate' },
      { header: 'Conversion', dataKey: 'conversion' },
      { header: 'Region', dataKey: 'region' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Source', dataKey: 'source' },
    ]

    switch (format) {
      case 'csv':
        ExportUtils.toCSV(paginatedData.data, 'analytics-export')
        break
      case 'excel':
        ExportUtils.toExcel(paginatedData.data, 'analytics-export')
        break
      case 'pdf':
        ExportUtils.toPDF(paginatedData.data, columns, 'analytics-export')
        break
    }
  }, [paginatedData])

  const kpiCards = useMemo(() => [
    {
      title: 'Total Revenue',
      value: aggregates ? formatCurrency(aggregates.totalRevenue) : '-',
      icon: <DollarSign className="h-5 w-5" />,
      trend: aggregates ? Math.random() * 20 - 10 : undefined,
      trendLabel: 'vs last period',
    },
    {
      title: 'Total Users',
      value: aggregates ? formatNumber(aggregates.totalUsers) : '-',
      icon: <Users className="h-5 w-5" />,
      trend: aggregates ? Math.random() * 20 - 10 : undefined,
      trendLabel: 'vs last period',
    },
    {
      title: 'Total Sessions',
      value: aggregates ? formatNumber(aggregates.totalSessions) : '-',
      icon: <Activity className="h-5 w-5" />,
      trend: aggregates ? Math.random() * 20 - 10 : undefined,
      trendLabel: 'vs last period',
    },
    {
      title: 'Avg Bounce Rate',
      value: aggregates ? formatPercentage(aggregates.avgBounceRate) : '-',
      icon: <TrendingUp className="h-5 w-5" />,
      trend: aggregates ? Math.random() * 20 - 10 : undefined,
      trendLabel: 'vs last period',
    },
    {
      title: 'Avg Conversion',
      value: aggregates ? formatPercentage(aggregates.avgConversion) : '-',
      icon: <TrendingUp className="h-5 w-5" />,
      trend: aggregates ? Math.random() * 20 - 10 : undefined,
      trendLabel: 'vs last period',
    },
    {
      title: 'Active Regions',
      value: aggregates ? formatNumber(aggregates.uniqueRegions) : '-',
      icon: <Globe className="h-5 w-5" />,
    },
  ], [aggregates])

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your analytics today.
          </p>
        </div>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileText className="mr-2 h-4 w-4" />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Alerts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {alerts.map(alert => (
          <AlertBanner
            key={alert.id}
            type={alert.type}
            message={alert.message}
            onClose={() => handleRemoveAlert(alert.id)}
          />
        ))}
      </div>

      {/* Filters */}
      <FilterBar
        onFilterChange={setFilters}
        regions={aggregates ? Array.from({ length: aggregates.uniqueRegions }) : []}
        categories={aggregates ? Array.from({ length: aggregates.uniqueCategories }) : []}
        sources={aggregates ? Array.from({ length: aggregates.uniqueSources }) : []}
      />

      {/* KPI Cards Grid */}
      <DashboardGrid>
        {kpiCards.map((kpi, index) => (
          <KPICard
            key={index}
            {...kpi}
            isLoading={aggregatesLoading}
          />
        ))}
      </DashboardGrid>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <RevenueChart data={chartData || []} isLoading={chartLoading} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <UsersChart data={chartData || []} isLoading={chartLoading} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <SessionsChart data={chartData || []} isLoading={chartLoading} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <ConversionChart data={chartData || []} isLoading={chartLoading} />
        </Suspense>
      </div>

      {/* Data Table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Detailed Analytics</h2>
        <DataTable
          data={paginatedData?.data || []}
          total={paginatedData?.pagination.total || 0}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          isLoading={tableLoading}
        />
      </div>
    </div>
  )
}