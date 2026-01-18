from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from core.database import Base


class TeacherContact(Base):
    """Teacher WhatsApp contacts mapped to clusters.

    Teachers do not authenticate in the system; they are identified only by
    their registered phone number and optional name, and linked to a cluster.
    """

    __tablename__ = "teacher_contacts"

    id = Column(Integer, primary_key=True, index=True)
    # Logical FK to clusters.id; kept as plain integer to avoid cross-metadata issues
    cluster_id = Column(Integer, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    # Store full E.164 or Indian-format number, e.g. "+9198XXXXXXX"
    phone_number = Column(String(32), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
