"""
Quick script to check database content
"""
from core.database import SessionLocal
from models.database_models import School, User, Cluster, Manual, Module

def check_data():
    db = SessionLocal()
    try:
        print("=== Database Content Check ===\n")
        
        # Schools
        schools = db.query(School).all()
        print(f"Schools: {len(schools)}")
        for school in schools[:3]:
            print(f"  - {school.school_name} (ID: {school.id})")
        
        # Users
        users = db.query(User).all()
        print(f"\nUsers: {len(users)}")
        for user in users[:5]:
            print(f"  - {user.name} ({user.role.value}) - {user.email}")
        
        # Clusters
        clusters = db.query(Cluster).all()
        print(f"\nClusters: {len(clusters)}")
        for cluster in clusters[:3]:
            print(f"  - {cluster.name} (ID: {cluster.id}, Teacher: {cluster.teacher_id}, School: {cluster.school_id})")
        
        # Manuals
        manuals = db.query(Manual).all()
        print(f"\nManuals: {len(manuals)}")
        for manual in manuals[:3]:
            print(f"  - {manual.title} (ID: {manual.id}, Cluster: {manual.cluster_id})")
        
        # Modules
        modules = db.query(Module).all()
        print(f"\nModules: {len(modules)}")
        for module in modules[:3]:
            print(f"  - {module.title} (ID: {module.id}, Approved: {module.approved})")
        
        print("\n=== Summary ===")
        print(f"Total Schools: {len(schools)}")
        print(f"Total Users: {len(users)}")
        print(f"Total Clusters: {len(clusters)}")
        print(f"Total Manuals: {len(manuals)}")
        print(f"Total Modules: {len(modules)}")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
