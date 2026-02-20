import { Theme } from '@/types'

export const chartColors = {
  primary: 'hsl(222.2, 47.4%, 11.2%)',
  secondary: 'hsl(215.4, 16.3%, 46.9%)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
}

export const chartGradients = {
  revenue: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0)'],
  users: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0)'],
  sessions: ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0)'],
}

export const getChartTheme = (theme: Theme) => ({
  textColor: theme === 'dark' ? '#f3f4f6' : '#1f2937',
  gridColor: theme === 'dark' ? '#374151' : '#e5e7eb',
  tooltip: {
    container: {
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
      border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
    },
  },
})

export const chartDefaults = {
  margin: { top: 10, right: 10, left: 10, bottom: 10 },
  animationDuration: 300,
}