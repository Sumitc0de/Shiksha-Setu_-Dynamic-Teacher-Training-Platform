from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.database_models import Cluster, User, UserRole
from schemas.api_schemas import ClusterCreate, ClusterUpdate, ClusterResponse
from api.auth import get_current_user

router = APIRouter(prefix="/api/clusters", tags=["Clusters"])

@router.post("/", response_model=ClusterResponse, status_code=status.HTTP_201_CREATED)
async def create_cluster(cluster: ClusterCreate, db: Session = Depends(get_db)):
    """Create a new cluster profile"""
    
    # Check if cluster name already exists
    existing = db.query(Cluster).filter(Cluster.name == cluster.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cluster with name '{cluster.name}' already exists"
        )
    
    db_cluster = Cluster(**cluster.model_dump())
    db.add(db_cluster)
    db.commit()
    db.refresh(db_cluster)
    
    return db_cluster

@router.get("/", response_model=List[ClusterResponse])
async def list_clusters(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """List all cluster profiles with pinned items first
    
    For teachers: excludes clusters they have hidden
    For principals and admins: shows all clusters
    """
    query = db.query(Cluster)
    
    # If user is a teacher, filter out their hidden clusters
    if current_user and current_user.role == UserRole.TEACHER:
        # Get list of hidden cluster IDs for this teacher
        hidden_cluster_ids = [c.id for c in current_user.hidden_clusters]
        if hidden_cluster_ids:
            query = query.filter(~Cluster.id.in_(hidden_cluster_ids))
    
    clusters = query.order_by(
        Cluster.pinned.desc(), 
        Cluster.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return clusters

@router.get("/{cluster_id}", response_model=ClusterResponse)
async def get_cluster(cluster_id: int, db: Session = Depends(get_db)):
    """Get a specific cluster by ID"""
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID {cluster_id} not found"
        )
    return cluster

@router.put("/{cluster_id}", response_model=ClusterResponse)
async def update_cluster(
    cluster_id: int, 
    cluster_update: ClusterUpdate, 
    db: Session = Depends(get_db)
):
    """Update a cluster profile"""
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID {cluster_id} not found"
        )
    
    # Update only provided fields
    update_data = cluster_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cluster, field, value)
    
    db.commit()
    db.refresh(cluster)
    
    return cluster

@router.delete("/{cluster_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cluster(
    cluster_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a cluster profile
    
    For teachers: soft delete (hide from their view only)
    For principals and admins: hard delete (permanently removes cluster)
    """
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID {cluster_id} not found"
        )
    
    # If user is a teacher, do soft delete (hide it)
    if current_user.role == UserRole.TEACHER:
        # Check if already hidden
        if cluster not in current_user.hidden_clusters:
            current_user.hidden_clusters.append(cluster)
            db.commit()
        return None
    
    # For admin and principal, do hard delete
    db.delete(cluster)
    db.commit()
    
    return None

@router.patch("/{cluster_id}/pin", response_model=ClusterResponse)
async def toggle_cluster_pin(cluster_id: int, db: Session = Depends(get_db)):
    """Toggle pin status for a cluster"""
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID {cluster_id} not found"
        )
    
    cluster.pinned = not cluster.pinned
    db.commit()
    db.refresh(cluster)
    
    return cluster
