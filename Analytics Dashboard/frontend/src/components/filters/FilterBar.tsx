import React, { memo, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { FilterState } from '@/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'

const filterSchema = z.object({
  dateRange: z.enum(['today', '7d', '30d', 'custom']),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
  region: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(),
})

type FilterFormData = z.infer<typeof filterSchema>

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
  regions?: string[]
  categories?: string[]
  sources?: string[]
  isLoading?: boolean
}

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
]

export const FilterBar = memo<FilterBarProps>(({
  onFilterChange,
  regions = [],
  categories = [],
  sources = [],
  isLoading = false,
}) => {
  const [savedFilters, setSavedFilters] = useLocalStorage<FilterState>(
    'dashboard-filters',
    { dateRange: '30d' }
  )
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: savedFilters,
  })

  const watchDateRange = watch('dateRange')

  useEffect(() => {
    const subscription = watch((value) => {
      const filters: FilterState = {
        dateRange: value.dateRange || '30d',
        ...(value.customStartDate && { customStartDate: value.customStartDate }),
        ...(value.customEndDate && { customEndDate: value.customEndDate }),
        ...(value.region && { region: value.region }),
        ...(value.category && { category: value.category }),
        ...(value.source && { source: value.source }),
      }
      onFilterChange(filters)
      setSavedFilters(filters)
    })
    return subscription.unsubscribe
  }, [watch, onFilterChange, setSavedFilters])

  const handleReset = useCallback(() => {
    reset({
      dateRange: '30d',
      customStartDate: undefined,
      customEndDate: undefined,
      region: undefined,
      category: undefined,
      source: undefined,
    })
  }, [reset])

  const handleClearFilter = useCallback((field: keyof FilterFormData) => {
    setValue(field, undefined)
  }, [setValue])

  const activeFiltersCount = Object.entries(watch()).filter(
    ([key, value]) => value && key !== 'dateRange' && value !== '30d'
  ).length

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2 lg:hidden"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </div>

        <div className={cn('grid gap-4', isExpanded ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4')}>
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select
              value={watchDateRange}
              onValueChange={(value: any) => setValue('dateRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {watchDateRange === 'custom' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  {...register('customStartDate')}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  {...register('customEndDate')}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Region Filter */}
          {(isExpanded || watchDateRange !== 'custom') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select
                value={watch('region')}
                onValueChange={(value) => setValue('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Filter */}
          {(isExpanded || watchDateRange !== 'custom') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Source Filter */}
          {(isExpanded || watchDateRange !== 'custom') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Select
                value={watch('source')}
                onValueChange={(value) => setValue('source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Active Filters Pills */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {watch('region') && watch('region') !== 'all' && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs">
                <span>Region: {watch('region')}</span>
                <button
                  onClick={() => handleClearFilter('region')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {watch('category') && watch('category') !== 'all' && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs">
                <span>Category: {watch('category')}</span>
                <button
                  onClick={() => handleClearFilter('category')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {watch('source') && watch('source') !== 'all' && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs">
                <span>Source: {watch('source')}</span>
                <button
                  onClick={() => handleClearFilter('source')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

FilterBar.displayName = 'FilterBar'