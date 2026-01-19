"""
Generate Fake Data for Shiksha-Setu Platform
This script populates the database with realistic demo data for testing
"""
import sys
import os
from datetime import datetime, timedelta
import random

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.orm import Session
from core.database import engine, Base, get_db
from models.database_models import User, UserRole, School, Cluster, Manual, Module

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt"""
    import bcrypt
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

# Indian states and districts
STATES_DISTRICTS = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Udaipur", "Ajmer"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar"]
}

# School names
SCHOOL_PREFIXES = ["Government", "Municipal", "Zilla Parishad", "Kendriya Vidyalaya", "State"]
SCHOOL_TYPES = ["Primary School", "High School", "Higher Secondary School", "Model School"]

# Teacher names
FIRST_NAMES = [
    "Rajesh", "Priya", "Amit", "Sunita", "Deepak", "Anita", "Rahul", "Meera",
    "Vijay", "Kavita", "Suresh", "Neha", "Arun", "Pooja", "Manoj", "Asha",
    "Sanjay", "Rekha", "Ramesh", "Geeta", "Nitin", "Shweta", "Prakash", "Usha"
]

LAST_NAMES = [
    "Kumar", "Sharma", "Patel", "Singh", "Deshmukh", "Reddy", "Verma", "Gupta",
    "Rao", "Nair", "Joshi", "Kulkarni", "Pandey", "Mishra", "Shah", "Mehta"
]

# Cluster configurations
GEOGRAPHIC_TYPES = ["Urban", "Rural", "Tribal"]
LANGUAGES = ["Hindi", "Marathi", "Tamil", "Kannada", "Telugu", "Bengali", "Gujarati", "Malayalam"]
INFRASTRUCTURE_LEVELS = ["High", "Medium", "Low"]

# Training topics
TRAINING_TOPICS = [
    "Digital Literacy",
    "Inclusive Education",
    "Assessment Methods",
    "Classroom Management",
    "Student Engagement",
    "Mathematics Teaching",
    "Science Experiments",
    "Language Teaching",
    "Arts Integration",
    "Physical Education"
]

def generate_email(first_name, last_name, domain="school.edu", counter=None):
    """Generate email address"""
    base = f"{first_name.lower()}.{last_name.lower()}".replace(" ", "")
    if counter:
        return f"{base}{counter}@{domain}"
    return f"{base}@{domain}"

def random_date_between(start_date, end_date):
    """Generate random date between two dates"""
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    return start_date + timedelta(days=random_days)

def create_schools(db: Session, count: int = 20):
    """Create fake schools"""
    schools = []
    print(f"\nCreating {count} schools...")
    
    for i in range(count):
        state = random.choice(list(STATES_DISTRICTS.keys()))
        district = random.choice(STATES_DISTRICTS[state])
        prefix = random.choice(SCHOOL_PREFIXES)
        school_type = random.choice(SCHOOL_TYPES)
        
        school = School(
            school_name=f"{prefix} {school_type}, {district}",
            district=district,
            state=state,
            school_type=school_type,
            total_teachers=random.randint(15, 50),
            created_at=random_date_between(datetime.now() - timedelta(days=730), datetime.now())
        )
        db.add(school)
        schools.append(school)
        print(f"  Created: {school.school_name}")
    
    db.commit()
    print(f"✓ Created {count} schools")
    return schools

def create_users(db: Session, schools: list):
    """Create fake users (admins, principals, teachers)"""
    users = []
    
    # Create 2 admin users
    print("\nCreating admin users...")
    admins = [
        {"name": "Dr. Rajesh Kumar", "email": "admin@shiksha-setu.gov.in"},
        {"name": "Dr. Anita Verma", "email": "admin2@shiksha-setu.gov.in"}
    ]
    
    for admin_data in admins:
        admin = User(
            name=admin_data["name"],
            email=admin_data["email"],
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True,
            last_login=random_date_between(datetime.now() - timedelta(days=7), datetime.now()),
            created_at=datetime.now() - timedelta(days=365)
        )
        db.add(admin)
        users.append(admin)
        print(f"  Created admin: {admin.name}")
    
    # Create principals (1-2 per school)
    print("\nCreating principals...")
    principals_count = 0
    principal_counter = {}
    for school in schools[:15]:  # Add principals to first 15 schools
        num_principals = random.randint(1, 2)
        for _ in range(num_principals):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            domain = f"principal.{school.district.lower()}.edu"
            
            # Track email counts to avoid duplicates
            key = f"{first_name}{last_name}{domain}"
            counter = principal_counter.get(key, 0) + 1
            principal_counter[key] = counter
            
            email = generate_email(first_name, last_name, domain, counter if counter > 1 else None)
            
            principal = User(
                name=f"{first_name} {last_name}",
                email=email,
                password_hash=get_password_hash("principal123"),
                role=UserRole.PRINCIPAL,
                school_id=school.id,
                is_active=True,
                last_login=random_date_between(datetime.now() - timedelta(days=30), datetime.now()),
                created_at=random_date_between(datetime.now() - timedelta(days=365), datetime.now())
            )
            db.add(principal)
            users.append(principal)
            principals_count += 1
    
    print(f"✓ Created {principals_count} principals")
    
    # Create teachers (3-8 per school)
    print("\nCreating teachers...")
    teachers_count = 0
    teacher_counter = {}
    for school in schools:
        num_teachers = random.randint(3, 8)
        for _ in range(num_teachers):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            domain = f"{school.district.lower()}.edu"
            
            # Track email counts to avoid duplicates
            key = f"{first_name}{last_name}{domain}"
            counter = teacher_counter.get(key, 0) + 1
            teacher_counter[key] = counter
            
            email = generate_email(first_name, last_name, domain, counter if counter > 1 else None)
            
            # Some teachers logged in recently, some not
            last_login = None
            if random.random() > 0.3:  # 70% have logged in
                last_login = random_date_between(datetime.now() - timedelta(days=60), datetime.now())
            
            teacher = User(
                name=f"{first_name} {last_name}",
                email=email,
                password_hash=get_password_hash("teacher123"),
                role=UserRole.TEACHER,
                school_id=school.id,
                is_active=True,
                last_login=last_login,
                created_at=random_date_between(datetime.now() - timedelta(days=365), datetime.now())
            )
            db.add(teacher)
            users.append(teacher)
            teachers_count += 1
    
    print(f"✓ Created {teachers_count} teachers")
    
    db.commit()
    print(f"✓ Total users created: {len(users)}")
    return users

def create_clusters(db: Session, count: int = 30):
    """Create fake training clusters"""
    clusters = []
    created_names = set()
    print(f"\nCreating {count} clusters...")
    
    attempts = 0
    max_attempts = count * 3
    
    while len(clusters) < count and attempts < max_attempts:
        attempts += 1
        geo_type = random.choice(GEOGRAPHIC_TYPES)
        language = random.choice(LANGUAGES)
        topic = random.choice(TRAINING_TOPICS)
        infra = random.choice(INFRASTRUCTURE_LEVELS)
        
        # Create unique name
        name = f"{geo_type} {language} - {topic} Training"
        
        # Skip if we already created this combination
        if name in created_names:
            continue
        
        created_names.add(name)
        
        cluster = Cluster(
            name=name,
            geographic_type=geo_type,
            primary_language=language,
            infrastructure_level=infra,
            specific_challenges=f"Training needs for {geo_type.lower()} areas with {infra.lower()} infrastructure",
            total_teachers=random.randint(10, 50),
            pinned=random.random() > 0.8,  # 20% are pinned
            created_at=random_date_between(datetime.now() - timedelta(days=180), datetime.now())
        )
        db.add(cluster)
        clusters.append(cluster)
        print(f"  Created: {cluster.name}")
    
    db.commit()
    print(f"✓ Created {len(clusters)} clusters")
    return clusters

def create_manuals(db: Session, clusters: list, count: int = 25):
    """Create fake training manuals"""
    manuals = []
    print(f"\nCreating {count} manuals...")
    
    manual_titles = [
        "Teacher Training Handbook",
        "Digital Teaching Methods",
        "Classroom Management Guide",
        "Assessment Strategies",
        "Student Engagement Techniques",
        "Inclusive Education Practices",
        "Mathematics Teaching Guide",
        "Science Laboratory Manual",
        "Language Teaching Methods",
        "Arts Integration Handbook"
    ]
    
    for i in range(count):
        cluster = random.choice(clusters)
        title = f"{random.choice(manual_titles)} - {cluster.primary_language}"
        
        manual = Manual(
            title=title,
            description=f"Comprehensive training manual for {cluster.primary_language} speaking teachers",
            filename=f"manual_{i+1}.pdf",
            file_path=f"/uploads/manuals/manual_{i+1}.pdf",
            language=cluster.primary_language,
            cluster_id=cluster.id,
            total_pages=random.randint(20, 100),
            upload_date=random_date_between(datetime.now() - timedelta(days=180), datetime.now()),
            indexed=True,
            pinned=random.random() > 0.85  # 15% are pinned
        )
        db.add(manual)
        manuals.append(manual)
        print(f"  Created: {title}")
    
    db.commit()
    print(f"✓ Created {count} manuals")
    return manuals

def create_modules(db: Session, manuals: list, clusters: list, count: int = 100):
    """Create fake training modules"""
    modules = []
    print(f"\nCreating {count} modules...")
    
    module_topics = [
        "Introduction to Concept",
        "Practical Application",
        "Assessment Methods",
        "Common Challenges",
        "Best Practices",
        "Case Studies",
        "Group Activities",
        "Individual Exercises",
        "Evaluation Techniques",
        "Real-world Examples"
    ]
    
    for i in range(count):
        manual = random.choice(manuals)
        cluster = manual.cluster if manual.cluster else random.choice(clusters)
        topic = random.choice(module_topics)
        
        # Some modules are approved, some pending
        approved = random.random() > 0.3  # 70% approved
        
        module = Module(
            title=f"{topic} - {manual.title[:30]}",
            manual_id=manual.id,
            cluster_id=cluster.id,
            original_content=f"Original training content for {topic} from manual {manual.title}",
            adapted_content=f"Adapted training content for {cluster.geographic_type} {cluster.primary_language} teachers. Focus on {topic.lower()} with practical examples.",
            target_language=cluster.primary_language,
            section_title=topic,
            module_metadata='{"approved": ' + str(approved).lower() + '}',
            created_at=random_date_between(datetime.now() - timedelta(days=120), datetime.now())
        )
        db.add(module)
        modules.append(module)
    
    print(f"✓ Created {count} modules")
    
    db.commit()
    return modules

def main():
    """Main function to generate all fake data"""
    print("=" * 60)
    print("Shiksha-Setu Fake Data Generator")
    print("=" * 60)
    
    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Get database session
    db = next(get_db())
    
    try:
        # Check if data already exists - always clear if more than 10 schools
        existing_schools = db.query(School).count()
        if existing_schools > 10:
            # Clear existing data
            print(f"\n⚠ Database already has {existing_schools} schools. Clearing and regenerating...")
            db.query(Module).delete()
            db.query(Manual).delete()
            db.query(Cluster).delete()
            db.query(User).delete()
            db.query(School).delete()
            db.commit()
            print("✓ Cleared existing data")
        
        # Generate data
        schools = create_schools(db, count=20)
        users = create_users(db, schools)
        clusters = create_clusters(db, count=30)
        manuals = create_manuals(db, clusters, count=25)
        modules = create_modules(db, manuals, clusters, count=100)
        
        # Print summary
        print("\n" + "=" * 60)
        print("DATA GENERATION COMPLETE")
        print("=" * 60)
        print(f"Schools:    {len(schools)}")
        print(f"Users:      {len(users)}")
        print(f"  - Admins:     {len([u for u in users if u.role == UserRole.ADMIN])}")
        print(f"  - Principals: {len([u for u in users if u.role == UserRole.PRINCIPAL])}")
        print(f"  - Teachers:   {len([u for u in users if u.role == UserRole.TEACHER])}")
        print(f"Clusters:   {len(clusters)}")
        print(f"Manuals:    {len(manuals)}")
        print(f"Modules:    {len(modules)}")
        print("=" * 60)
        print("\n✓ All fake data generated successfully!")
        print("\nLogin credentials:")
        print("  Admin:     admin@shiksha-setu.gov.in / admin123")
        print("  Principal: Use any principal email / principal123")
        print("  Teacher:   Use any teacher email / teacher123")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
