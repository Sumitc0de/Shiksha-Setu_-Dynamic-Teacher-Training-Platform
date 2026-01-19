from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum

from core.database import Base


class UserRole(enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"


class School(Base):
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    school_id = Column(Integer, nullable=True)