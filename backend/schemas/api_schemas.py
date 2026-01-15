from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ClusterBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    geographic_type: str = Field(..., description="Urban, Rural, or Tribal")
    primary_language: str = Field(..., min_length=1, max_length=50)
    infrastructure_level: str = Field(..., description="High, Medium, or Low")
    specific_challenges: Optional[str] = Field(None, max_length=500)
    total_teachers: int = Field(..., ge=1, le=10000)
    additional_notes: Optional[str] = Field(None, max_length=500)

class ClusterCreate(ClusterBase):
    pass

class ClusterUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    geographic_type: Optional[str] = None
    primary_language: Optional[str] = None
    infrastructure_level: Optional[str] = None
    specific_challenges: Optional[str] = None
    total_teachers: Optional[int] = Field(None, ge=1, le=10000)
    additional_notes: Optional[str] = None

class ClusterResponse(ClusterBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ManualBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    language: str = Field(..., description="Content language")
    cluster_id: Optional[int] = None

class ManualCreate(ManualBase):
    filename: str
    file_path: str
    total_pages: Optional[int] = None

class ManualResponse(ManualBase):
    id: int
    filename: str
    total_pages: Optional[int]
    upload_date: datetime
    indexed: bool
    
    class Config:
        from_attributes = True

class ModuleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    manual_id: int
    cluster_id: int
    original_content: str
    adapted_content: str
    target_language: Optional[str] = None
    section_title: Optional[str] = None

class ModuleCreate(ModuleBase):
    pass

class ModuleResponse(ModuleBase):
    id: int
    metadata: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FeedbackBase(BaseModel):
    module_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5")
    comment: Optional[str] = None

class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class FeedbackResponse(FeedbackBase):
    id: int
    submitted_at: datetime
    
    class Config:
        from_attributes = True

class GenerateModuleRequest(BaseModel):
    manual_id: int
    cluster_id: int
    original_content: str = Field(..., min_length=50, max_length=5000)
    target_language: Optional[str] = None
    section_title: Optional[str] = Field(None, max_length=200)
