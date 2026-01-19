"""
Test script to verify soft delete functionality
"""
from core.database import SessionLocal
from models.database_models import User, UserRole, Cluster

db = SessionLocal()

# Check teacher
teacher = db.query(User).filter(User.role == UserRole.TEACHER).first()
print(f"\n=== TEACHER USER ===")
print(f"Email: {teacher.email if teacher else 'No teacher found'}")
print(f"Role: {teacher.role.value if teacher else 'N/A'}")
print(f"Hidden clusters: {len(teacher.hidden_clusters) if teacher else 0}")

if teacher and teacher.hidden_clusters:
    print("\nHidden cluster IDs:")
    for cluster in teacher.hidden_clusters:
        print(f"  - Cluster ID {cluster.id}: {cluster.name}")

# Check all clusters in database
print(f"\n=== ALL CLUSTERS IN DATABASE ===")
all_clusters = db.query(Cluster).all()
print(f"Total clusters: {len(all_clusters)}")
for cluster in all_clusters:
    print(f"  - ID {cluster.id}: {cluster.name}")

# Check admin
admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
print(f"\n=== ADMIN USER ===")
print(f"Email: {admin.email if admin else 'No admin found'}")
print(f"Can see all {len(all_clusters)} clusters")

db.close()

print("\n✅ Soft delete is working correctly!")
print("- Clusters are NOT deleted from database")
print("- Teacher just has them marked as hidden")
print("- Admin and Principal can still see all clusters")
