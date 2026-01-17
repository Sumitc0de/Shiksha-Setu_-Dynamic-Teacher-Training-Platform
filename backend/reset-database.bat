@echo off
echo Resetting database with updated schema...
del shiksha_setu.db 2>nul
python init_database.py
echo.
echo Database reset complete! Now restart the backend server.
pause
