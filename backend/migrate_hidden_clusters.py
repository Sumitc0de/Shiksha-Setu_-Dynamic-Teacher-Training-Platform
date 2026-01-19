"""
Migration script to add hidden_clusters table for soft delete functionality
Run this to update your database schema
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text, inspect
from core.config import settings

def migrate_hidden_clusters():
    """Add the hidden_clusters association table"""
    engine = create_engine(settings.database_url)
    inspector = inspect(engine)
    
    # Check if table already exists
    if 'hidden_clusters' in inspector.get_table_names():
        print("✓ hidden_clusters table already exists")
        return
    
    # SQL to create the hidden_clusters table
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS hidden_clusters (
        user_id INTEGER NOT NULL,
        cluster_id INTEGER NOT NULL,
        hidden_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, cluster_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (cluster_id) REFERENCES clusters (id) ON DELETE CASCADE
    );
    """
    
    # Create index for better query performance
    create_index_sql = """
    CREATE INDEX IF NOT EXISTS idx_hidden_clusters_user 
    ON hidden_clusters (user_id);
    """
    
    with engine.connect() as conn:
        print("Creating hidden_clusters table...")
        conn.execute(text(create_table_sql))
        conn.commit()
        
        print("Creating index on hidden_clusters...")
        conn.execute(text(create_index_sql))
        conn.commit()
        
        print("\n✅ Migration completed successfully!")
        print("→ Teachers can now hide clusters without affecting school/admin users")

if __name__ == "__main__":
    migrate_hidden_clusters()
