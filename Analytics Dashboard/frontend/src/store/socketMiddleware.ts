import { Middleware } from '@reduxjs/toolkit'
import { io, Socket } from 'socket.io-client'
import { analyticsApi } from '@/services/analyticsApi'

let socket: Socket | null = null

export const socketMiddleware: Middleware = (store) => (next) => (action) => {
  // Connect to socket when user is authenticated
  if (action.type === 'auth/login/fulfilled') {
    const token = action.payload.token
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    })

    socket.on('analytics-event', (event) => {
      // Handle real-time events
      console.log('WebSocket event:', event)
      
      // Show toast based on event type
      // Invalidate queries to refresh data
      store.dispatch(analyticsApi.util.invalidateTags(['Analytics']))
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  // Disconnect on logout
  if (action.type === 'auth/logout') {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }

  return next(action)
}