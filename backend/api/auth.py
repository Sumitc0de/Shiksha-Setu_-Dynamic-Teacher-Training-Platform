"""
Authentication API Endpoints
Handles user login, logout, and role-based access control
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import jwt
import bcrypt

from core.database import get_db
from models.database_models import User, UserRole, School

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# Security configuration
SECRET_KEY = "shiksha-setu-secret-key-change-in-production"  # Change in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Pydantic schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    school_id: Optional[int] = None
    school_name: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class DashboardStats(BaseModel):
    """Dashboard statistics based on user role"""
    total_schools: Optional[int] = 0
    total_teachers: Optional[int] = 0
    total_clusters: Optional[int] = 0
    total_manuals: Optional[int] = 0
    total_modules: Optional[int] = 0
    approved_modules: Optional[int] = 0


# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against hashed password"""
    # Truncate password to 72 bytes if needed (bcrypt limitation)
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Truncate password to 72 bytes if needed (bcrypt limitation)
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token
    
    **Roles:**
    - ADMIN: Government officials monitoring all schools
    - PRINCIPAL: School/University administrators monitoring teachers
    - TEACHER: End users of the platform
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role.value}
    )
    
    # Get school information if applicable
    school_name = None
    if user.school:
        school_name = user.school.school_name
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role.value,
            school_id=user.school_id,
            school_name=school_name
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    school_name = None
    if current_user.school:
        school_name = current_user.school.school_name
    
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role.value,
        school_id=current_user.school_id,
        school_name=school_name
    )


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics based on user role
    
    - ADMIN: See all schools, teachers, clusters, manuals, modules
    - PRINCIPAL: See teachers and activities within their school
    - TEACHER: See their own clusters and modules
    """
    from models.database_models import Cluster, Manual, Module
    
    stats = DashboardStats()
    
    if current_user.role == UserRole.ADMIN:
        # Admin sees everything
        stats.total_schools = db.query(School).count()
        stats.total_teachers = db.query(User).filter(User.role == UserRole.TEACHER).count()
        stats.total_clusters = db.query(Cluster).count()
        stats.total_manuals = db.query(Manual).count()
        stats.total_modules = db.query(Module).count()
        stats.approved_modules = db.query(Module).filter(Module.approved == True).count()
    
    elif current_user.role == UserRole.PRINCIPAL:
        # Principal sees their school's data
        if current_user.school_id:
            stats.total_schools = 1  # Their school
            stats.total_teachers = db.query(User).filter(
                User.school_id == current_user.school_id,
                User.role == UserRole.TEACHER
            ).count()
            stats.total_clusters = db.query(Cluster).filter(
                Cluster.school_id == current_user.school_id
            ).count()
            stats.total_manuals = db.query(Manual).join(Cluster).filter(
                Cluster.school_id == current_user.school_id
            ).count()
            stats.total_modules = db.query(Module).join(Cluster).filter(
                Cluster.school_id == current_user.school_id
            ).count()
            stats.approved_modules = db.query(Module).join(Cluster).filter(
                Cluster.school_id == current_user.school_id,
                Module.approved == True
            ).count()
    
    elif current_user.role == UserRole.TEACHER:
        # Teacher sees their own data
        stats.total_clusters = db.query(Cluster).filter(
            Cluster.teacher_id == current_user.id
        ).count()
        stats.total_modules = db.query(Module).join(Cluster).filter(
            Cluster.teacher_id == current_user.id
        ).count()
        stats.approved_modules = db.query(Module).join(Cluster).filter(
            Cluster.teacher_id == current_user.id,
            Module.approved == True
        ).count()
    
    return stats


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout endpoint (client should discard token)"""
    return {"message": "Successfully logged out"}
