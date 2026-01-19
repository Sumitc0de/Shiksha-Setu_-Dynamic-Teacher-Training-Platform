#!/bin/bash
# Render deployment startup script

echo "Starting Shiksha Setu on Render..."
cd backend
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
