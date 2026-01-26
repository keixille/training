#!/bin/bash

# Check if PROJECT_DIR environment variable is set
if [ -z "$PROJECT_DIR" ]; then
    echo "Error: PROJECT_DIR environment variable is not set."
    echo "Please set it using the following command. Change app to your folder name."
    echo "export PROJECT_DIR=/home/project/app/lib"
    exit 1
else
    echo "Using PROJECT_DIR: $PROJECT_DIR"
fi

# Function to check if inotify-tools and lsof are installed
check_and_install_tools() {
    # Check if inotifywait (from inotify-tools) is installed
    if ! command -v inotifywait &> /dev/null; then
        echo "inotify-tools not found. Installing..."
        sudo apt update
        sudo apt install -y inotify-tools
    else
        echo "inotify-tools is already installed."
    fi

    # Check if lsof is installed
    if ! command -v lsof &> /dev/null; then
        echo "lsof not found. Installing..."
        sudo apt update
        sudo apt install -y lsof
    else
        echo "lsof is already installed."
    fi
}


# Function to check and kill process using a specific port
check_and_kill_port() {
    PORT=$1
    # Find the process running on the specified port
    PID=$(lsof -t -i:$PORT)

    if [ ! -z "$PID" ]; then
        echo "Port $PORT is already in use by process $PID. Stopping the process..."
        kill -9 $PID
        echo "Process $PID on port $PORT has been terminated."
    else
        echo "Port $PORT is free."
    fi
}

# Function to run Flutter web server
start_server() {
    echo "Starting Flutter web server..."

    # Check and stop any process using port 8080 before starting the server
    check_and_kill_port 8080

    cd $PROJECT_DIR/..
    flutter build web
    # Goto build directory
    cd build/web
    # Start server on port 8080
    python3 -m http.server 8080 &
    SERVER_PID=$!

    echo "Flutter server started with PID $SERVER_PID"
}


# Function to stop Flutter web server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        echo "Stopping Flutter web server with PID $SERVER_PID"
        kill $SERVER_PID
        wait $SERVER_PID 2>/dev/null
    fi
}

# Watch for file changes and restart server
watch_and_reload() {
    inotifywait -m -r -e modify,create,delete --exclude '\.git|build|\.dart_tool|\.idea|\.vscode' $PROJECT_DIR |
    while read -r directory events filename; do
        echo "Change detected in $directory$filename. Restarting server..."
        stop_server
        start_server
    done
}

# Cleanup function to handle script exit
cleanup() {
    echo "Cleaning up before exit..."
    stop_server
    exit 0
}

# Trap SIGINT (Ctrl-C) and call the cleanup function
trap cleanup SIGINT

# Ensure inotify-tools is installed before starting the server
check_and_install_tools

# Initial server start
start_server

# Start watching for changes
watch_and_reload