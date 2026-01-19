from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ClusterBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Cluster name must be at least 2 characters")
    geographic_type: str = Field(..., description="Urban, Rural, Tribal, etc.")
    primary_language: str = Field(..., min_length=1, max_length=50)
    infrastructure_level: str = Field(..., description="High, Medium, Low")
    specific_challenges: Optional[str] = Field(None)
    total_teachers: int = Field(..., ge=0)
    additional_notes: Optional[str] = Field(None)

class ClusterCreate(ClusterBase):
    pass

class ClusterUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="Cluster name must be at least 2 characters")
    geographic_type: Optional[str] = None
    primary_language: Optional[str] = None
    infrastructure_level: Optional[str] = None
    specific_challenges: Optional[str] = None
    total_teachers: Optional[int] = Field(None, ge=0)
    additional_notes: Optional[str] = None

class ClusterResponse(ClusterBase):
    id: int
    pinned: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ManualBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200, description="Manual title must be at least 2 characters")

class ManualCreate(ManualBase):
    filename: str
    file_path: str
    total_pages: Optional[int] = None

class ManualResponse(BaseModel):
    id: int
    title: str
    filename: str
    file_path: Optional[str] = None
    total_pages: Optional[int] = None
    upload_date: datetime
    indexed: bool
    pinned: bool = False
    processed: Optional[str] = None
    detected_language: Optional[str] = None
    adapted_summary: Optional[str] = None
    key_points: Optional[list] = None
    
    class Config:
        from_attributes = True

class ModuleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    manual_id: int
    cluster_id: int
    original_content: str
    adapted_content: str
    language: Optional[str] = None
    learning_objective: Optional[str] = None

class ModuleCreate(ModuleBase):
    pass

class ModuleResponse(BaseModel):
    id: int
    title: str
    manual_id: int
    cluster_id: int
    original_content: str
    adapted_content: str
    language: Optional[str] = None
    learning_objective: Optional[str] = None
    approved: bool = False
    created_at: datetime
    # Make updated_at optional so it doesn't break with existing Module model/DB
    updated_at: Optional[datetime] = None
    
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
    topic: str = Field(..., min_length=2, max_length=200, description="Topic to generate content for")
    target_language: Optional[str] = None
