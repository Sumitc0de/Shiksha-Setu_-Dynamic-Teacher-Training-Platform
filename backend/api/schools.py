"""
Schools API Endpoints  
Endpoints for school/university administrators to monitor their teachers
"""
from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel

from core.database import get_db
from models.database_models import User, UserRole, School, Cluster, Module
from api.auth import get_current_user

router = APIRouter(prefix="/schools", tags=["Schools"])


# Pydantic schemas
class SchoolDashboard(BaseModel):
    school_id: int
    school_name: str
    district: Optional[str]
    state: Optional[str]
    total_teachers: int
    active_teachers: int
    total_clusters: int
    total_modules: int
    approved_modules: int
    pending_modules: int


class TeacherActivity(BaseModel):
    id: int
    name: str
    email: str
    total_clusters: int
    total_modules: int
    approved_modules: int
    last_login: Optional[datetime]
    recent_activity: Optional[str]


class ClusterInfo(BaseModel):
    id: int
    name: str
    teacher_name: str
    region_type: str
    language: str
    topic: Optional[str]
    total_modules: int
    created_at: datetime


class ModuleInfo(BaseModel):
    id: int
    title: str
    cluster_name: str
    teacher_name: str
    language: Optional[str]
    approved: bool
    created_at: datetime


def require_principal(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require PRINCIPAL role"""
    if current_user.role not in [UserRole.PRINCIPAL, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Principal or Admin access required"
        )
    return current_user


@router.get("/dashboard", response_model=SchoolDashboard)
async def get_school_dashboard(
    current_user: User = Depends(require_principal),
    db: Session = Depends(get_db)
):
    """
    Get dashboard for school/university administrator
    Shows overview of all teachers and their activities
    """
    if not current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with a school"
        )
    
    school = db.query(School).filter(School.id == current_user.school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Calculate statistics
    total_teachers = db.query(User).filter(
        User.school_id == current_user.school_id,
        User.role == UserRole.TEACHER
    ).count()
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_teachers = db.query(User).filter(
        User.school_id == current_user.school_id,
        User.role == UserRole.TEACHER,
        User.last_login >= thirty_days_ago
    ).count()
    
    # For now, show total platform stats as school doesn't directly link to clusters
    # In future, add school_id to clusters for better tracking
    total_clusters = db.query(Cluster).count()
    total_modules = db.query(Module).count()
    
    # Count approved modules from all modules
    approved_modules = db.query(Module).filter(Module.approved == True).count()
    pending_modules = db.query(Module).filter(Module.approved == False).count()
    
    return SchoolDashboard(
        school_id=school.id,
        school_name=school.school_name,
        district=school.district,
        state=school.state,
        total_teachers=total_teachers,
        active_teachers=active_teachers,
        total_clusters=total_clusters,
        total_modules=total_modules,
        approved_modules=approved_modules,
        pending_modules=pending_modules
    )


@router.get("/teachers", response_model=List[TeacherActivity])
async def list_school_teachers(
    current_user: User = Depends(require_principal),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    List all teachers in the school with their activity metrics
    """
    if not current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with a school"
        )
    
    teachers = db.query(User).filter(
        User.school_id == current_user.school_id,
        User.role == UserRole.TEACHER
    ).offset(skip).limit(limit).all()
    
    result = []
    for teacher in teachers:
        # For now, show 0 as clusters aren't directly linked to teachers
        total_clusters = 0
        total_modules = 0
        approved_modules = 0
        
        recent_activity = None
        if teacher.last_login:
            days_ago = (datetime.utcnow() - teacher.last_login).days
            if days_ago == 0:
                recent_activity = "Active today"
            elif days_ago == 1:
                recent_activity = "Active yesterday"
            elif days_ago <= 7:
                recent_activity = f"Active {days_ago} days ago"
            else:
                recent_activity = f"Last seen {days_ago} days ago"
        
        result.append(TeacherActivity(
            id=teacher.id,
            name=teacher.name,
            email=teacher.email,
            total_clusters=total_clusters,
            total_modules=total_modules,
            approved_modules=approved_modules,
            last_login=teacher.last_login,
            recent_activity=recent_activity
        ))
    
    return result


@router.get("/clusters", response_model=List[ClusterInfo])
async def list_school_clusters(
    current_user: User = Depends(require_principal),
    db: Session = Depends(get_db),
    teacher_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    List all clusters in the school
    Optionally filter by teacher
    """
    if not current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with a school"
        )
    
    # Get all clusters for now (not filtered by school)
    clusters = db.query(Cluster).offset(skip).limit(limit).all()
    
    result = []
    for cluster in clusters:
        total_modules = db.query(Module).filter(Module.cluster_id == cluster.id).count()
        
        result.append(ClusterInfo(
            id=cluster.id,
            name=cluster.name,
            teacher_name="System",
            region_type=cluster.geographic_type,
            language=cluster.primary_language,
            topic=cluster.name.split('-')[-1].strip() if '-' in cluster.name else "General",
            total_modules=total_modules,
            created_at=cluster.created_at
        ))
    
    return result


@router.get("/modules", response_model=List[ModuleInfo])
async def list_school_modules(
    current_user: User = Depends(require_principal),
    db: Session = Depends(get_db),
    teacher_id: Optional[int] = Query(None),
    approved: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    List all modules created by teachers in the school
    Optionally filter by teacher and approval status
    """
    if not current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with a school"
        )
    
    # Get all modules (not filtered by school for now)
    query = db.query(Module)
    
    if approved is not None:
        query = query.filter(Module.approved == approved)
    
    modules = query.offset(skip).limit(limit).all()
    
    result = []
    for module in modules:
        cluster = db.query(Cluster).filter(Cluster.id == module.cluster_id).first()
        
        result.append(ModuleInfo(
            id=module.id,
            title=module.title,
            cluster_name=cluster.name if cluster else "Unknown",
            teacher_name="System",
            language=module.target_language,
            approved=module.approved,
            created_at=module.created_at
        ))
    
    return result


@router.get("/teachers/{teacher_id}", response_model=TeacherActivity)
async def get_teacher_details(
    teacher_id: int,
    current_user: User = Depends(require_principal),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific teacher
    """
    if not current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with a school"
        )
    
    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.school_id == current_user.school_id,
        User.role == UserRole.TEACHER
    ).first()
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    total_clusters = db.query(Cluster).filter(Cluster.teacher_id == teacher.id).count()
    total_modules = db.query(Module).join(Cluster).filter(Cluster.teacher_id == teacher.id).count()
    approved_modules = db.query(Module).join(Cluster).filter(
        Cluster.teacher_id == teacher.id,
        Module.approved == True
    ).count()
    
    recent_module = db.query(Module).join(Cluster).filter(
        Cluster.teacher_id == teacher.id
    ).order_by(desc(Module.created_at)).first()
    
    recent_activity = None
    if recent_module:
        days_ago = (datetime.utcnow() - recent_module.created_at).days
        if days_ago == 0:
            recent_activity = "Created module today"
        elif days_ago == 1:
            recent_activity = "Created module yesterday"
        else:
            recent_activity = f"Created module {days_ago} days ago"
    
    return TeacherActivity(
        id=teacher.id,
        name=teacher.name,
        email=teacher.email,
        total_clusters=total_clusters,
        total_modules=total_modules,
        approved_modules=approved_modules,
        last_login=teacher.last_login,
        recent_activity=recent_activity
    )
