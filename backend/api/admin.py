"""
Admin API Endpoints
Endpoints for government administrators to monitor all schools and teachers
"""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel

from core.database import get_db
from models.database_models import User, UserRole, School, Cluster, Manual, Module
from api.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])


# Pydantic schemas
class SchoolListItem(BaseModel):
    id: int
    school_name: str
    district: Optional[str]
    state: Optional[str]
    school_type: Optional[str]
    total_teachers: Optional[int]
    active_teachers: int
    total_clusters: int
    total_modules: int
    created_at: datetime


class TeacherListItem(BaseModel):
    id: int
    name: str
    email: str
    school_name: Optional[str]
    school_id: Optional[int]
    total_clusters: int
    total_modules: int
    last_login: Optional[datetime]
    created_at: datetime


class ActivityLogItem(BaseModel):
    id: int
    type: str  # cluster_created, manual_uploaded, module_generated, module_approved
    title: str
    user_name: str
    school_name: Optional[str]
    timestamp: datetime


class GeographicStats(BaseModel):
    state: str
    total_schools: int
    total_teachers: int
    total_districts: int


class SchoolTypeStats(BaseModel):
    school_type: str
    count: int
    percentage: float


class DistrictStats(BaseModel):
    district: str
    state: str
    total_schools: int
    total_teachers: int


class SchoolStats(BaseModel):
    id: int
    school_name: str
    district: str
    state: str
    school_type: Optional[str]
    total_teachers: int
    active_teachers: int
    total_modules: int
    approved_modules: int


class AdminOverview(BaseModel):
    total_schools: int
    total_teachers: int
    active_teachers: int  # Logged in last 30 days
    total_clusters: int
    total_manuals: int
    total_modules: int
    approved_modules: int
    pending_modules: int
    recent_activities: List[ActivityLogItem]
    states_breakdown: Optional[List[GeographicStats]] = []
    school_types_breakdown: Optional[List[SchoolTypeStats]] = []


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require ADMIN role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/overview", response_model=AdminOverview)
async def get_admin_overview(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get complete overview for government administrators
    Shows all schools, teachers, and platform activity
    """
    from datetime import timedelta
    
    # Calculate active teachers (logged in last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_teachers_count = db.query(User).filter(
        User.role == UserRole.TEACHER,
        User.last_login >= thirty_days_ago
    ).count()
    
    # Get recent activities
    recent_activities = []
    
    # Recent clusters
    recent_clusters = db.query(Cluster).order_by(desc(Cluster.created_at)).limit(5).all()
    for cluster in recent_clusters:
        recent_activities.append({
            "id": cluster.id,
            "type": "cluster_created",
            "title": f"Cluster Created: {cluster.name}",
            "user_name": "System",
            "school_name": None,
            "timestamp": cluster.created_at
        })
    
    # Recent modules
    recent_modules = db.query(Module).order_by(desc(Module.created_at)).limit(5).all()
    for module in recent_modules:
        cluster = db.query(Cluster).filter(Cluster.id == module.cluster_id).first()
        recent_activities.append({
            "id": module.id,
            "type": "module_generated",
            "title": f"Module Generated: {module.title[:50]}...",
            "user_name": "System",
            "school_name": None,
            "timestamp": module.created_at
        })
    
    # Sort by timestamp
    recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)
    recent_activities = recent_activities[:10]
    
    # Geographic breakdown by state
    states_stats = db.query(
        School.state,
        func.count(School.id).label('total_schools'),
        func.count(func.distinct(School.district)).label('total_districts')
    ).group_by(School.state).all()
    
    states_breakdown = []
    for state_data in states_stats:
        if state_data.state:  # Only include if state is not null
            teacher_count = db.query(User).join(School).filter(
                School.state == state_data.state,
                User.role == UserRole.TEACHER
            ).count()
            states_breakdown.append(GeographicStats(
                state=state_data.state,
                total_schools=state_data.total_schools,
                total_teachers=teacher_count,
                total_districts=state_data.total_districts
            ))
    
    # School type breakdown
    total_schools_count = db.query(School).count()
    school_types_stats = db.query(
        School.school_type,
        func.count(School.id).label('count')
    ).group_by(School.school_type).all()
    
    school_types_breakdown = []
    for type_data in school_types_stats:
        if type_data.school_type:  # Only include if school_type is not null
            percentage = (type_data.count / total_schools_count * 100) if total_schools_count > 0 else 0
            school_types_breakdown.append(SchoolTypeStats(
                school_type=type_data.school_type,
                count=type_data.count,
                percentage=round(percentage, 1)
            ))
    
    return AdminOverview(
        total_schools=total_schools_count,
        total_teachers=db.query(User).filter(User.role == UserRole.TEACHER).count(),
        active_teachers=active_teachers_count,
        total_clusters=db.query(Cluster).count(),
        total_manuals=db.query(Manual).count(),
        total_modules=db.query(Module).count(),
        approved_modules=db.query(Module).filter(Module.approved == True).count(),
        pending_modules=db.query(Module).filter(Module.approved == False).count(),
        recent_activities=[ActivityLogItem(**activity) for activity in recent_activities],
        states_breakdown=states_breakdown,
        school_types_breakdown=school_types_breakdown
    )


@router.get("/schools", response_model=List[SchoolListItem])
async def list_all_schools(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    List all schools with statistics
    """
    schools = db.query(School).offset(skip).limit(limit).all()
    
    result = []
    for school in schools:
        # Count teachers in this school
        total_teachers_count = db.query(User).filter(
            User.school_id == school.id,
            User.role == UserRole.TEACHER
        ).count()
        
        active_teachers = db.query(User).filter(
            User.school_id == school.id,
            User.role == UserRole.TEACHER,
            User.is_active == True,
            User.last_login != None
        ).count()
        
        # For now, show 0 clusters and modules as they're not directly linked to schools
        # In a future version, you could add school_id to clusters
        total_clusters = 0
        total_modules = 0
        
        result.append(SchoolListItem(
            id=school.id,
            school_name=school.school_name,
            district=school.district,
            state=school.state,
            school_type=school.school_type,
            total_teachers=total_teachers_count,
            active_teachers=active_teachers,
            total_clusters=total_clusters,
            total_modules=total_modules,
            created_at=school.created_at
        ))
    
    return result


@router.get("/teachers", response_model=List[TeacherListItem])
async def list_all_teachers(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    school_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    List all teachers with their activity
    Optionally filter by school
    """
    query = db.query(User).filter(User.role == UserRole.TEACHER)
    
    if school_id:
        query = query.filter(User.school_id == school_id)
    
    teachers = query.offset(skip).limit(limit).all()
    
    result = []
    for teacher in teachers:
        school = db.query(School).filter(School.id == teacher.school_id).first()
        # For now, show 0 clusters and modules as they're not directly linked to teachers
        # In a future version, you could add teacher_id to clusters
        total_clusters = 0
        total_modules = 0
        
        result.append(TeacherListItem(
            id=teacher.id,
            name=teacher.name,
            email=teacher.email,
            school_name=school.school_name if school else None,
            school_id=teacher.school_id,
            total_clusters=total_clusters,
            total_modules=total_modules,
            last_login=teacher.last_login,
            created_at=teacher.created_at
        ))
    
    return result


@router.get("/schools/{school_id}", response_model=SchoolListItem)
async def get_school_details(
    school_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific school
    """
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    active_teachers = db.query(User).filter(
        User.school_id == school.id,
        User.role == UserRole.TEACHER,
        User.is_active == True
    ).count()
    
    total_clusters = db.query(Cluster).filter(Cluster.school_id == school.id).count()
    total_modules = db.query(Module).join(Cluster).filter(Cluster.school_id == school.id).count()
    
    return SchoolListItem(
        id=school.id,
        school_name=school.school_name,
        district=school.district,
        state=school.state,
        school_type=school.school_type,
        total_teachers=school.total_teachers,
        active_teachers=active_teachers,
        total_clusters=total_clusters,
        total_modules=total_modules,
        created_at=school.created_at
    )

@router.get("/geographic/districts/{state}", response_model=List[DistrictStats])
async def get_districts_by_state(
    state: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all districts in a specific state with statistics
    """
    districts = db.query(
        School.district,
        School.state,
        func.count(School.id).label('total_schools'),
        func.sum(School.total_teachers).label('total_teachers')
    ).filter(
        School.state == state
    ).group_by(
        School.district, School.state
    ).all()
    
    return [
        DistrictStats(
            district=d.district,
            state=d.state,
            total_schools=d.total_schools,
            total_teachers=d.total_teachers or 0
        )
        for d in districts
    ]


@router.get("/geographic/schools/{state}/{district}", response_model=List[SchoolStats])
async def get_schools_by_district(
    state: str,
    district: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all schools in a specific district with statistics
    """
    schools = db.query(School).filter(
        School.state == state,
        School.district == district
    ).all()
    
    result = []
    for school in schools:
        active_teachers = db.query(User).filter(
            User.school_id == school.id,
            User.role == UserRole.TEACHER,
            User.is_active == True
        ).count()
        
        # Note: Cluster model doesn't have school_id, so we can't track modules per school
        # Modules are tracked at platform/cluster level, not school level
        
        result.append(SchoolStats(
            id=school.id,
            school_name=school.school_name,
            district=school.district,
            state=school.state,
            school_type=school.school_type,
            total_teachers=school.total_teachers or 0,
            active_teachers=active_teachers,
            total_modules=0,  # Not available without school_id in Cluster
            approved_modules=0  # Not available without school_id in Cluster
        ))
    
    return result


@router.get("/school/{school_id}/stats", response_model=SchoolStats)
async def get_school_stats(
    school_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed statistics for a specific school
    """
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    active_teachers = db.query(User).filter(
        User.school_id == school.id,
        User.role == UserRole.TEACHER,
        User.is_active == True
    ).count()
    
    # Note: Cluster model doesn't have school_id, so we can't track modules per school
    # Modules are tracked at platform/cluster level, not school level
    
    return SchoolStats(
        id=school.id,
        school_name=school.school_name,
        district=school.district,
        state=school.state,
        school_type=school.school_type,
        total_teachers=school.total_teachers or 0,
        active_teachers=active_teachers,
        total_modules=0,  # Not available without school_id in Cluster
        approved_modules=0  # Not available without school_id in Cluster
    )