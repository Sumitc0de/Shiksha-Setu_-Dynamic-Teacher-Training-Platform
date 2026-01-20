"""
Migration script to add user_hidden_clusters association table
Run this to create the table for tracking which clusters users have hidden
"""
from sqlalchemy import create_engine, text
from core.config import settings

def migrate():
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        # Check if table exists
        result = conn.execute(text("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_hidden_clusters'
        """))
        
        if result.fetchone():
            print("Table user_hidden_clusters already exists, skipping creation")
            return
        
        # Create the association table
        conn.execute(text("""
            CREATE TABLE user_hidden_clusters (
                user_id INTEGER NOT NULL,
                cluster_id INTEGER NOT NULL,
                PRIMARY KEY (user_id, cluster_id),
                FOREIGN KEY(user_id) REFERENCES users (id),
                FOREIGN KEY(cluster_id) REFERENCES clusters (id)
            )
        """))
        conn.commit()
        
        print("Successfully created user_hidden_clusters table")

if __name__ == "__main__":
    migrate()
