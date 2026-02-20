#!/bin/bash

echo "🚀 Starting Analytics Dashboard..."

# Function to kill processes on exit
cleanup() {
    echo "🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting backend server (tsx watch)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Start frontend
echo "🎨 Starting frontend (Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📝 WebSocket: ws://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID