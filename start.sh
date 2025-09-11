#!/bin/bash

echo "Starting NIGGA SCIENCE Imageboard..."
echo

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
echo "Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install client dependencies"
    exit 1
fi

echo
echo "Starting server..."
cd ../server
npm run dev &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 3

echo "Starting client..."
cd ../client
npm run dev &
CLIENT_PID=$!

echo
echo "NIGGA SCIENCE is starting up!"
echo "Server: http://localhost:5000"
echo "Client: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait
