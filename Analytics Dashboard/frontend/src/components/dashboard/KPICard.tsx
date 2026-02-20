import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  isLoading?: boolean
  className?: string
}

const TrendIndicator = memo(({ trend }: { trend: number }) => {
  if (trend > 0) {
    return (
      <div className="flex items-center text-green-600 dark:text-green-400">
        <TrendingUp className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">+{trend}%</span>
      </div>
    )
  }
  if (trend < 0) {
    return (
      <div className="flex items-center text-red-600 dark:text-red-400">
        <TrendingDown className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">{trend}%</span>
      </div>
    )
  }
  return (
    <div className="flex items-center text-gray-500 dark:text-gray-400">
      <Minus className="h-4 w-4 mr-1" />
      <span className="text-sm font-medium">0%</span>
    </div>
  )
})

TrendIndicator.displayName = 'TrendIndicator'

export const KPICard = memo<KPICardProps>(({
  title,
  value,
  icon,
  trend,
  trendLabel,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          {trend !== undefined && <Skeleton className="h-4 w-16" />}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-lg', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            <TrendIndicator trend={trend} />
            {trendLabel && (
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

KPICard.displayName = 'KPICard'