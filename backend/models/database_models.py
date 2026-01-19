from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)

    # Note: field names are aligned with schemas.api_schemas.ClusterBase
    region_type = Column(String(50), nullable=False)
    language = Column(String(50), nullable=False)
    infrastructure_constraints = Column(Text, nullable=True)
    key_issues = Column(Text, nullable=True)
    grade_range = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    manuals = relationship("Manual", back_populates="cluster", cascade="all,delete-orphan")
    modules = relationship("Module", back_populates="cluster", cascade="all,delete-orphan")


class Manual(Base):
    __tablename__ = "manuals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)

    # File metadata
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)

    # Processing status
    is_indexed = Column(Boolean, default=False, nullable=False)
    indexed_at = Column(DateTime, nullable=True)

    # Relationships
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False)
    cluster = relationship("Cluster", back_populates="manuals")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    modules = relationship("Module", back_populates="manual", cascade="all,delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    adapted_content = Column(Text, nullable=False)
    original_content = Column(Text, nullable=True)
    language = Column(String(50), nullable=True)

    # Status and approval
    status = Column(String(50), default="draft", nullable=False)  # draft, pending_approval, approved, rejected
    approved_at = Column(DateTime, nullable=True)
    feedback = Column(Text, nullable=True)

    # Relationships
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False)
    cluster = relationship("Cluster", back_populates="modules")

    manual_id = Column(Integer, ForeignKey("manuals.id"), nullable=True)
    manual = relationship("Manual", back_populates="modules")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    user_id = Column(Integer, nullable=True)  # Optional for anonymous feedback
    rating = Column(Integer, nullable=True)  # 1-5 scale
    comments = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ExportedPDF(Base):
    __tablename__ = "exported_pdfs"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    language = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)