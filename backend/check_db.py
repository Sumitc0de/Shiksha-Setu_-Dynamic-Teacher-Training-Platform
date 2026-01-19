"""Check database schema"""
from sqlalchemy import create_engine, inspect
from core.config import settings

engine = create_engine(settings.database_url)
inspector = inspect(engine)

print("=== CLUSTERS TABLE ===")
columns = inspector.get_columns('clusters')
for col in columns:
    print(f"  {col['name']}: {col['type']}")

print("\n=== MANUALS TABLE ===")
columns = inspector.get_columns('manuals')
for col in columns:
    print(f"  {col['name']}: {col['type']}")
