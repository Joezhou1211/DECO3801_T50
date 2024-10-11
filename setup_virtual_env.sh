#!/bin/bash

# Check if Python is installed
echo "Checking Python installation..."
if ! command -v python &> /dev/null; then
    echo "Python is not installed. Please install Python and try again."
    exit 1
else
    echo "Python found."
fi

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate the virtual environment
echo "Activating virtual environment on Unix-based system..."
source ./venv/bin/activate

echo "Virtual environment setup and activation complete!"
