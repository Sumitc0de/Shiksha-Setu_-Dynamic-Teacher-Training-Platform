from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models.database_models import Cluster
from models.teacher_models import TeacherContact
from schemas.api_schemas import TeacherContactCreate, TeacherContactResponse


router = APIRouter(
    prefix="/{cluster_id}/teachers",
    tags=["Teachers"],
)


def _normalize_indian_number(raw: str) -> str:
    """Normalize Indian phone numbers to a Twilio-friendly format.

    This keeps "+"-prefixed numbers as-is, and for 10-digit numbers assumes
    Indian country code +91.
    """
    num = raw.strip().replace(" ", "")
    if num.startswith("+"):
        return num
    # Remove leading zeros
    while num.startswith("0"):
        num = num[1:]
    if len(num) == 10 and num.isdigit():
        return "+91" + num
    return num


@router.post(
    "/",
    response_model=TeacherContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a teacher contact for a cluster",
    response_description="Teacher contact created successfully",
)
async def add_teacher_contact(
    cluster_id: int,
    payload: TeacherContactCreate,
    db: Session = Depends(get_db),
):
    """Register a teacher's WhatsApp number against a specific cluster.

    This endpoint is intended for admins to register teachers who will receive
    approved training modules directly on WhatsApp.
    """

    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID {cluster_id} not found",
        )

    phone_normalized = _normalize_indian_number(payload.phone_number)

    contact = TeacherContact(
        cluster_id=cluster_id,
        name=payload.name,
        phone_number=phone_normalized,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact


@router.get(
    "/",
    response_model=List[TeacherContactResponse],
    summary="List teacher contacts for a cluster",
    response_description="List of teacher contacts for the cluster",
)
async def list_teacher_contacts(
    cluster_id: int,
    db: Session = Depends(get_db),
):
    """List all teacher contacts registered for the given cluster."""

    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID {cluster_id} not found",
        )

    contacts = (
        db.query(TeacherContact)
        .filter(TeacherContact.cluster_id == cluster_id)
        .order_by(TeacherContact.id.asc())
        .all()
    )
    return contacts
