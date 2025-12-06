#!/bin/bash

echo "========================================"
echo "   SQL Chatbot Setup Script"
echo "========================================"
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo "[1/5] Python found!"
python3 --version
echo ""

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "[2/5] Virtual environment already exists"
else
    echo "[2/5] Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to create virtual environment"
        exit 1
    fi
    echo "Virtual environment created successfully!"
fi
echo ""

# Activate virtual environment
echo "[3/5] Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to activate virtual environment"
    exit 1
fi
echo ""

# Install dependencies
echo "[4/5] Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi
echo ""

# Check for .env file
if [ -f ".env" ]; then
    echo "[5/5] .env file already exists"
else
    echo "[5/5] Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "[IMPORTANT] Please edit .env file and add your GEMINI_API_KEY"
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
fi
echo ""

echo "========================================"
echo "   Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Edit .env file and add your GEMINI_API_KEY"
echo "  2. Run: python main.py (for CLI mode)"
echo "  3. Or run: python api.py (for API + Web UI mode)"
echo ""
echo "To activate the virtual environment manually later:"
echo "  source venv/bin/activate"
echo ""
echo "For more information, see README.md or QUICKSTART.md"
echo ""
