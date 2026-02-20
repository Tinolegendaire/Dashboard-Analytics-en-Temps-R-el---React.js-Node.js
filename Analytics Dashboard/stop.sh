#!/bin/bash

echo "🛑 Stopping Analytics Dashboard..."

# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Kill any remaining node processes related to the project
pkill -f "tsx watch" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "✅ All services stopped"