#!/usr/bin/env python3
"""
Database initialization script for Render deployment
This ensures all tables are created before the application starts
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

print("=" * 60)
print("Shiksha Setu - Database Initialization for Render")
print("=" * 60)

try:
    # Initialize database
    from core.database import init_db
    
    print("\n[1/3] Initializing database and creating tables...")
    init_db()
    print("✓ Database tables created successfully")
    
    # Initialize users if needed
    print("\n[2/3] Checking for default users...")
    from core.database import SessionLocal
    from models.database_models import User
    
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("No users found. Creating default users...")
            # Import and run the user initialization
            import init_users_schools
            print("✓ Default users created")
        else:
            print(f"✓ Found {user_count} existing users")
    finally:
        db.close()
    
    print("\n[3/3] Verifying database integrity...")
    from sqlalchemy import inspect
    from core.database import engine
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"✓ Database contains {len(tables)} tables:")
    for table in sorted(tables):
        columns = inspector.get_columns(table)
        print(f"   - {table} ({len(columns)} columns)")
    
    print("\n" + "=" * 60)
    print("✓ Database initialization completed successfully!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n✗ Error during database initialization: {e}")
    import traceback
    traceback.print_exc()
    print("\n" + "=" * 60)
    print("✗ Database initialization FAILED")
    print("=" * 60)
    sys.exit(1)
