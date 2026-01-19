"""
Test soft delete for all user roles
"""
from core.database import SessionLocal
from models.database_models import User, UserRole, Cluster

db = SessionLocal()

# Get all clusters
all_clusters = db.query(Cluster).all()
print(f"\n=== TOTAL CLUSTERS IN DATABASE ===")
print(f"Total: {len(all_clusters)}")
for c in all_clusters:
    print(f"  - ID {c.id}: {c.name}")

# Test for each role
print(f"\n=== TEACHER VIEW ===")
teacher = db.query(User).filter(User.email == "priya.deshmukh@school.edu").first()
if teacher:
    print(f"User: {teacher.email}")
    print(f"Role: {teacher.role.value}")
    print(f"Hidden clusters: {len(teacher.hidden_clusters)}")
    
    # Simulate what teacher sees (exclude hidden)
    hidden_ids = [c.id for c in teacher.hidden_clusters]
    visible = [c for c in all_clusters if c.id not in hidden_ids]
    print(f"Visible clusters for teacher: {len(visible)}")
    for c in visible:
        print(f"  - ID {c.id}: {c.name}")

print(f"\n=== PRINCIPAL VIEW ===")
principal = db.query(User).filter(User.email == "principal.mumbai@school.edu").first()
if principal:
    print(f"User: {principal.email}")
    print(f"Role: {principal.role.value}")
    print(f"Hidden clusters: {len(principal.hidden_clusters)}")
    
    # Principal should see ALL clusters
    print(f"Should see ALL {len(all_clusters)} clusters")
    for c in all_clusters:
        print(f"  - ID {c.id}: {c.name}")

print(f"\n=== ADMIN VIEW ===")
admin = db.query(User).filter(User.email == "admin@shiksha-setu.gov.in").first()
if admin:
    print(f"User: {admin.email}")
    print(f"Role: {admin.role.value}")
    print(f"Hidden clusters: {len(admin.hidden_clusters)}")
    
    # Admin should see ALL clusters
    print(f"Should see ALL {len(all_clusters)} clusters")

db.close()
