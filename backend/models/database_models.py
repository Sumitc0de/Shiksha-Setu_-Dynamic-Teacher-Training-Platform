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
    total_pages = Column(Integer, nullable=True)

    # RAG indexing status
    indexed = Column(Boolean, default=False, nullable=False)

    upload_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=True)
    cluster = relationship("Cluster", back_populates="manuals")

    modules = relationship("Module", back_populates="manual", cascade="all,delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)

    manual_id = Column(Integer, ForeignKey("manuals.id"), nullable=False, index=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False, index=True)

    original_content = Column(Text, nullable=False)
    adapted_content = Column(Text, nullable=False)
    language = Column(String(50), nullable=True)

    approved = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    manual = relationship("Manual", back_populates="modules")
    cluster = relationship("Cluster", back_populates="modules")
    feedback_items = relationship(
        "Feedback",
        back_populates="module",
        cascade="all,delete-orphan",
    )
    exported_pdfs = relationship(
        "ExportedPDF",
        back_populates="module",
        cascade="all,delete-orphan",
    )


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)

    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False, index=True)
    is_helpful = Column(Boolean, nullable=False)
    comment = Column(Text, nullable=True)

    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    module = relationship("Module", back_populates="feedback_items")


class ExportedPDF(Base):
    __tablename__ = "exported_pdfs"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    language = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    module = relationship("Module", back_populates="exported_pdfs")
