"""
Database migration script to add pinned column to clusters and manuals tables.
This script adds a 'pinned' boolean column with default value False to both tables.

Run this script once to migrate existing database:
    python add_pinned_column.py
"""

import sqlite3
import os
from pathlib import Path

def get_db_path():
    """Get the database path"""
    # Try multiple possible locations
    possible_paths = [
        Path(__file__).parent / "shiksha_setu.db",
        Path(__file__).parent / "backend.db",
        Path(__file__).parent / "database.db",
    ]
    
    for path in possible_paths:
        if path.exists():
            return str(path)
    
    # Default to creating new database in backend folder
    return str(Path(__file__).parent / "shiksha_setu.db")

def migrate_database():
    """Add pinned column to clusters and manuals tables"""
    db_path = get_db_path()
    print(f"Migrating database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if clusters table exists and has pinned column
        cursor.execute("PRAGMA table_info(clusters)")
        clusters_columns = [column[1] for column in cursor.fetchall()]
        
        if 'pinned' not in clusters_columns:
            print("Adding 'pinned' column to clusters table...")
            cursor.execute("""
                ALTER TABLE clusters 
                ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT 0
            """)
            print("✓ Added 'pinned' column to clusters table")
        else:
            print("✓ 'pinned' column already exists in clusters table")
        
        # Check if manuals table exists and has pinned column
        cursor.execute("PRAGMA table_info(manuals)")
        manuals_columns = [column[1] for column in cursor.fetchall()]
        
        if 'pinned' not in manuals_columns:
            print("Adding 'pinned' column to manuals table...")
            cursor.execute("""
                ALTER TABLE manuals 
                ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT 0
            """)
            print("✓ Added 'pinned' column to manuals table")
        else:
            print("✓ 'pinned' column already exists in manuals table")
        
        conn.commit()
        print("\n✓ Migration completed successfully!")
        
        # Show current table structure
        print("\n--- Clusters table structure ---")
        cursor.execute("PRAGMA table_info(clusters)")
        for col in cursor.fetchall():
            print(f"  {col[1]}: {col[2]}")
        
        print("\n--- Manuals table structure ---")
        cursor.execute("PRAGMA table_info(manuals)")
        for col in cursor.fetchall():
            print(f"  {col[1]}: {col[2]}")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"✗ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Database Migration: Add Pinned Column")
    print("=" * 60)
    print()
    
    success = migrate_database()
    
    print()
    print("=" * 60)
    if success:
        print("Migration completed. You can now use the pin feature!")
    else:
        print("Migration failed. Please check the error messages above.")
    print("=" * 60)
