import sys
sys.path.insert(0, '.')

from core.database import SessionLocal
from models.database_models import User, UserRole

db = SessionLocal()

print("\n" + "="*60)
print("AVAILABLE LOGIN CREDENTIALS")
print("="*60)

# Admin
print("\n[ADMIN ACCOUNTS]")
admins = db.query(User).filter_by(role=UserRole.ADMIN).all()
for admin in admins:
    print(f"  Email: {admin.email}")
    print(f"  Password: admin123\n")

# Principals (first 3)
print("[PRINCIPAL ACCOUNTS - Sample]")
principals = db.query(User).filter_by(role=UserRole.PRINCIPAL).limit(3).all()
for principal in principals:
    print(f"  Email: {principal.email}")
    print(f"  Name: {principal.name}")
    print(f"  Password: principal123\n")

# Teachers (first 3)
print("[TEACHER ACCOUNTS - Sample]")
teachers = db.query(User).filter_by(role=UserRole.TEACHER).limit(3).all()
for teacher in teachers:
    print(f"  Email: {teacher.email}")
    print(f"  Name: {teacher.name}")
    print(f"  Password: teacher123\n")

print("="*60)
db.close()
