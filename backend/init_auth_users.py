"""
Initialize test users for authentication system
Creates 3 test users: Admin, Principal, and Teacher
"""
from datetime import datetime
from pathlib import Path
import sys

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.orm import Session
import bcrypt

from core.database import SessionLocal, init_db
from models.auth_models import User, UserRole, School


def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Truncate password to 72 bytes if needed (bcrypt limitation)
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def init_test_users():
    """Initialize test users and schools"""
    print("Initializing database...")
    init_db()
    
    db: Session = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"Users already exist ({existing_users} users found). Skipping initialization.")
            return
        
        print("Creating test schools...")
        
        # Create test schools
        school1 = School(
            school_name="Mumbai Government School",
            district="Mumbai",
            state="Maharashtra",
            school_type="Primary School",
            total_teachers=50
        )
        
        school2 = School(
            school_name="Delhi Public University",
            district="New Delhi",
            state="Delhi",
            school_type="University",
            total_teachers=200
        )
        
        school3 = School(
            school_name="Bangalore International School",
            district="Bangalore",
            state="Karnataka",
            school_type="Secondary School",
            total_teachers=100
        )
        
        db.add_all([school1, school2, school3])
        db.commit()
        db.refresh(school1)
        db.refresh(school2)
        db.refresh(school3)
        
        print(f"✓ Created {school1.school_name}")
        print(f"✓ Created {school2.school_name}")
        print(f"✓ Created {school3.school_name}")
        
        print("\nCreating test users...")
        
        # Create ADMIN user (Government official)
        admin_user = User(
            name="Dr. Rajesh Kumar",
            email="admin@shiksha-setu.gov.in",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            school_id=None,  # Admin oversees all schools
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        # Create PRINCIPAL users (School administrators)
        principal1 = User(
            name="Mrs. Anita Sharma",
            email="principal.mumbai@school.edu",
            password_hash=get_password_hash("principal123"),
            role=UserRole.PRINCIPAL,
            school_id=school1.id,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        principal2 = User(
            name="Prof. Vikram Singh",
            email="principal.delhi@university.edu",
            password_hash=get_password_hash("principal123"),
            role=UserRole.PRINCIPAL,
            school_id=school2.id,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        # Create TEACHER users
        teacher1 = User(
            name="Priya Deshmukh",
            email="priya.deshmukh@school.edu",
            password_hash=get_password_hash("teacher123"),
            role=UserRole.TEACHER,
            school_id=school1.id,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        teacher2 = User(
            name="Amit Patel",
            email="amit.patel@school.edu",
            password_hash=get_password_hash("teacher123"),
            role=UserRole.TEACHER,
            school_id=school2.id,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        teacher3 = User(
            name="Lakshmi Reddy",
            email="lakshmi.reddy@school.edu",
            password_hash=get_password_hash("teacher123"),
            role=UserRole.TEACHER,
            school_id=school3.id,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add_all([admin_user, principal1, principal2, teacher1, teacher2, teacher3])
        db.commit()
        
        print("\n✅ Test users created successfully!\n")
        print("=" * 60)
        print("LOGIN CREDENTIALS")
        print("=" * 60)
        print("\n1. ADMIN (Government Official)")
        print("   Email:    admin@shiksha-setu.gov.in")
        print("   Password: admin123")
        print("   Role:     Monitor all schools and universities")
        print("\n2. PRINCIPAL (Mumbai Government School)")
        print("   Email:    principal.mumbai@school.edu")
        print("   Password: principal123")
        print("   Role:     Monitor teachers in Mumbai School")
        print("\n3. PRINCIPAL (Delhi Public University)")
        print("   Email:    principal.delhi@university.edu")
        print("   Password: principal123")
        print("   Role:     Monitor teachers in Delhi University")
        print("\n4. TEACHER (Mumbai)")
        print("   Email:    priya.deshmukh@school.edu")
        print("   Password: teacher123")
        print("   Role:     Main platform user")
        print("\n5. TEACHER (Delhi)")
        print("   Email:    amit.patel@school.edu")
        print("   Password: teacher123")
        print("   Role:     Main platform user")
        print("\n6. TEACHER (Bangalore)")
        print("   Email:    lakshmi.reddy@school.edu")
        print("   Password: teacher123")
        print("   Role:     Main platform user")
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_test_users()
