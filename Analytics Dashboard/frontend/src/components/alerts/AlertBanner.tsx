import React, { useEffect, useRef } from 'react'
import { AlertTriangle, Bell, TrendingDown, Users, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertBannerProps {
  type: 'revenue' | 'conversion' | 'bounce'
  message: string
  onClose: () => void
  autoHide?: boolean
  autoHideDuration?: number
}

const alertIcons = {
  revenue: DollarSign,
  conversion: TrendingDown,
  bounce: Users,
}

const alertColors = {
  revenue: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  conversion: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200',
  bounce: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  onClose,
  autoHide = true,
  autoHideDuration = 5000,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Play sound for bounce alerts
    if (type === 'bounce') {
      audioRef.current = new Audio('/sounds/alert.mp3')
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      })
    }

    // Trigger mobile vibration for conversion alerts
    if (type === 'conversion' && 'vibrate' in navigator) {
      navigator.vibrate(200)
    }

    if (autoHide) {
      timeoutRef.current = setTimeout(onClose, autoHideDuration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [type, autoHide, autoHideDuration, onClose])

  const Icon = alertIcons[type]

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-top-5',
        alertColors[type]
      )}
      role="alert"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/5"
      >
        <span className="sr-only">Close</span>
        <AlertTriangle className="h-4 w-4" />
      </button>

      {/* Animated indicator for bounce alerts */}
      {type === 'bounce' && (
        <div className="absolute -top-1 -right-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}
    </div>
  )
}