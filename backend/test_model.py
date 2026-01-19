"""Direct test of model definition"""
import sys
from pathlib import Path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from models.database_models import Cluster, Manual
from sqlalchemy import inspect

# Check what columns are defined in the Cluster model
print("=== Cluster Model Columns ===")
for column in Cluster.__table__.columns:
    print(f"  {column.name}: {column.type} (nullable={column.nullable}, default={column.default})")

print("\n=== Manual Model Columns ===")
for column in Manual.__table__.columns:
    print(f"  {column.name}: {column.type} (nullable={column.nullable}, default={column.default})")
