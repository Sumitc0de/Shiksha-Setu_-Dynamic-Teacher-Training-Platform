#!/bin/bash
# Render build script for Shiksha Setu backend

echo "====================================="
echo "Shiksha Setu - Render Build Script"
echo "====================================="

# Install Python dependencies
echo ""
echo "[1/3] Installing Python dependencies..."
pip install -r requirements.txt

# Initialize database
echo ""
echo "[2/3] Initializing database..."
cd backend
python init_db_render.py

# Verify installation
echo ""
echo "[3/3] Verifying installation..."
python -c "import fastapi; import sqlalchemy; print('✓ Core dependencies verified')"

echo ""
echo "====================================="
echo "✓ Build completed successfully!"
echo "====================================="
