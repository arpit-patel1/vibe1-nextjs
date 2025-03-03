#!/bin/bash

# Kill any process using port 3000
echo "Killing any process using port 3000..."
lsof -t -i:3000 | xargs kill 2>/dev/null

# Kill any process using port 3001 (in case server started on alternative port)
echo "Killing any process using port 3001..."
lsof -t -i:3001 | xargs kill 2>/dev/null

# Kill any process using port 3001 (in case server started on alternative port)
echo "Killing any process using port 3002..."
lsof -t -i:3002 | xargs kill 2>/dev/null

# Kill any process using port 3001 (in case server started on alternative port)
echo "Killing any process using port 3003..."
lsof -t -i:3003 | xargs kill 2>/dev/null

# Kill any process using port 3001 (in case server started on alternative port)
echo "Killing any process using port 3004..."
lsof -t -i:3004 | xargs kill 2>/dev/null

# Kill any process using port 3001 (in case server started on alternative port)
echo "Killing any process using port 3005..."
lsof -t -i:3005 | xargs kill 2>/dev/null

# Kill any process using port 3001 (in case server started on alternative port)
echo "Killing any process using port 3006..."
lsof -t -i:3006 | xargs kill 2>/dev/null

# Wait a moment for processes to terminate
sleep 1

# Start the development server
echo "Starting new development server..."
npm run dev 