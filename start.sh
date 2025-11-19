#!/bin/bash
# start ruby server and cli together

echo "🚀 starting ruby distributed system..."

# load environment
source ~/.zshrc

# function to cleanup on exit
cleanup() {
    echo "🛑 shutting down ruby system..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# trap signals for cleanup
trap cleanup SIGINT SIGTERM

echo "📡 starting ruby server..."
cd packages/core
node dist/server-main.js &
SERVER_PID=$!

# wait for server to start
echo "⏳ waiting for server to start..."
sleep 3

# check if server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ server is running on localhost:3001"
else
    echo "❌ server failed to start"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "💻 starting ruby cli..."
cd ../cli
node dist/index.js &
CLI_PID=$!

echo ""
echo "🎉 ruby system is running!"
echo "   server: localhost:3001"
echo "   cli: interactive terminal"
echo ""
echo "press ctrl+c to stop everything"

# wait for processes
wait