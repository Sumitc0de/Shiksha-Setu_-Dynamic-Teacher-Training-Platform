"""
Database Migration Script - Updates schema to match PRD requirements
Run this to migrate from old schema to new schema
"""

import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """Migrate database schema from old to new structure"""
    
    engine = create_engine(settings.database_url)
    
    logger.info("Starting database migration...")
    
    with engine.connect() as conn:
        try:
            # Start transaction
            trans = conn.begin()
            
            # CLUSTERS TABLE MIGRATION
            logger.info("Migrating clusters table...")
            
            # Check if old columns exist
            result = conn.execute(text("PRAGMA table_info(clusters)"))
            columns = {row[1] for row in result}
            
            if 'region_type' in columns:
                # Rename region_type to geographic_type
                conn.execute(text("""
                    CREATE TABLE clusters_new (
                        id INTEGER PRIMARY KEY,
                        name VARCHAR(100) UNIQUE NOT NULL,
                        geographic_type VARCHAR(50) NOT NULL,
                        primary_language VARCHAR(50) NOT NULL,
                        infrastructure_level VARCHAR(20) NOT NULL,
                        specific_challenges TEXT,
                        total_teachers INTEGER NOT NULL DEFAULT 50,
                        additional_notes TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                # Copy data with field mapping
                conn.execute(text("""
                    INSERT INTO clusters_new 
                    (id, name, geographic_type, primary_language, infrastructure_level, 
                     specific_challenges, total_teachers, additional_notes, created_at, updated_at)
                    SELECT 
                        id, 
                        name, 
                        region_type, 
                        language, 
                        COALESCE(
                            CASE 
                                WHEN infrastructure_constraints LIKE '%high%' THEN 'High'
                                WHEN infrastructure_constraints LIKE '%low%' THEN 'Low'
                                ELSE 'Medium'
                            END,
                            'Medium'
                        ),
                        key_issues,
                        50,
                        grade_range,
                        created_at,
                        updated_at
                    FROM clusters
                """))
                
                # Drop old table and rename new
                conn.execute(text("DROP TABLE clusters"))
                conn.execute(text("ALTER TABLE clusters_new RENAME TO clusters"))
                logger.info("✓ Clusters table migrated")
            else:
                logger.info("✓ Clusters table already up to date")
            
            # MANUALS TABLE MIGRATION
            logger.info("Migrating manuals table...")
            
            result = conn.execute(text("PRAGMA table_info(manuals)"))
            columns = {row[1] for row in result}
            
            if 'description' not in columns:
                conn.execute(text("""
                    CREATE TABLE manuals_new (
                        id INTEGER PRIMARY KEY,
                        title VARCHAR(200) NOT NULL,
                        description TEXT,
                        filename VARCHAR(200) NOT NULL,
                        file_path VARCHAR(500) NOT NULL,
                        language VARCHAR(50) NOT NULL DEFAULT 'english',
                        cluster_id INTEGER,
                        total_pages INTEGER,
                        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                        indexed BOOLEAN DEFAULT 0,
                        FOREIGN KEY (cluster_id) REFERENCES clusters(id)
                    )
                """))
                
                conn.execute(text("""
                    INSERT INTO manuals_new 
                    (id, title, filename, file_path, total_pages, upload_date, indexed)
                    SELECT id, title, filename, file_path, total_pages, upload_date, indexed
                    FROM manuals
                """))
                
                conn.execute(text("DROP TABLE manuals"))
                conn.execute(text("ALTER TABLE manuals_new RENAME TO manuals"))
                logger.info("✓ Manuals table migrated")
            else:
                logger.info("✓ Manuals table already up to date")
            
            # MODULES TABLE MIGRATION
            logger.info("Migrating modules table...")
            
            result = conn.execute(text("PRAGMA table_info(modules)"))
            columns = {row[1] for row in result}
            
            if 'language' in columns and 'target_language' not in columns:
                conn.execute(text("""
                    CREATE TABLE modules_new (
                        id INTEGER PRIMARY KEY,
                        title VARCHAR(200) NOT NULL,
                        manual_id INTEGER NOT NULL,
                        cluster_id INTEGER NOT NULL,
                        original_content TEXT NOT NULL,
                        adapted_content TEXT NOT NULL,
                        target_language VARCHAR(50),
                        section_title VARCHAR(200),
                        metadata TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (manual_id) REFERENCES manuals(id),
                        FOREIGN KEY (cluster_id) REFERENCES clusters(id)
                    )
                """))
                
                conn.execute(text("""
                    INSERT INTO modules_new 
                    (id, title, manual_id, cluster_id, original_content, adapted_content, 
                     target_language, created_at)
                    SELECT id, title, manual_id, cluster_id, original_content, adapted_content,
                           language, created_at
                    FROM modules
                """))
                
                conn.execute(text("DROP TABLE modules"))
                conn.execute(text("ALTER TABLE modules_new RENAME TO modules"))
                logger.info("✓ Modules table migrated")
            else:
                logger.info("✓ Modules table already up to date")
            
            # FEEDBACK TABLE MIGRATION
            logger.info("Migrating feedback table...")
            
            result = conn.execute(text("PRAGMA table_info(feedback)"))
            columns = {row[1] for row in result}
            
            if 'is_helpful' in columns:
                conn.execute(text("""
                    CREATE TABLE feedback_new (
                        id INTEGER PRIMARY KEY,
                        module_id INTEGER NOT NULL,
                        rating INTEGER NOT NULL,
                        comment TEXT,
                        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (module_id) REFERENCES modules(id)
                    )
                """))
                
                # Convert is_helpful boolean to rating (1-5 scale)
                conn.execute(text("""
                    INSERT INTO feedback_new (id, module_id, rating, comment, submitted_at)
                    SELECT id, module_id, 
                           CASE WHEN is_helpful = 1 THEN 5 ELSE 2 END,
                           comment, submitted_at
                    FROM feedback
                """))
                
                conn.execute(text("DROP TABLE feedback"))
                conn.execute(text("ALTER TABLE feedback_new RENAME TO feedback"))
                logger.info("✓ Feedback table migrated")
            else:
                logger.info("✓ Feedback table already up to date")
            
            # Commit transaction
            trans.commit()
            logger.info("✅ Database migration completed successfully!")
            
        except Exception as e:
            trans.rollback()
            logger.error(f"❌ Migration failed: {str(e)}")
            raise

if __name__ == "__main__":
    print("\n" + "="*60)
    print("DATABASE MIGRATION SCRIPT")
    print("="*60)
    print("\nThis will update your database schema to match the new PRD requirements.")
    print("BACKUP YOUR DATABASE BEFORE PROCEEDING!")
    print("\n" + "="*60 + "\n")
    
    response = input("Continue with migration? (yes/no): ")
    
    if response.lower() == 'yes':
        migrate_database()
    else:
        print("Migration cancelled.")
