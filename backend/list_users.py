from core.database import SessionLocal
from models.database_models import User, UserRole

db = SessionLocal()

print("=" * 60)
print("ADMIN ACCOUNTS")
print("=" * 60)
admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
for admin in admins:
    print(f"Email: {admin.email}")
    print(f"Name: {admin.name}")
    print(f"Password: admin123")
    print()

print("=" * 60)
print("PRINCIPAL ACCOUNTS (Sample)")
print("=" * 60)
principals = db.query(User).filter(User.role == UserRole.PRINCIPAL).limit(10).all()
for principal in principals:
    print(f"Email: {principal.email}")
    print(f"Name: {principal.name}")
    print(f"School: {principal.school.school_name if principal.school else 'N/A'}")
    print(f"Password: principal123")
    print()

print("=" * 60)
print("TEACHER ACCOUNTS (Sample)")
print("=" * 60)
teachers = db.query(User).filter(User.role == UserRole.TEACHER).limit(10).all()
for teacher in teachers:
    print(f"Email: {teacher.email}")
    print(f"Name: {teacher.name}")
    print(f"School: {teacher.school.school_name if teacher.school else 'N/A'}")
    print(f"Password: teacher123")
    print()

db.close()
