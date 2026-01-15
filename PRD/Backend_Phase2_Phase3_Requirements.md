# Shiksha-Setu Backend - Phase 2 & Phase 3 Requirements

**Project:** Shiksha-Setu Dynamic Teacher Training Platform  
**Document Type:** Backend Enhancement Requirements (PRD)  
**Phases:** Phase 2 (Should-Have Features) & Phase 3 (Production Readiness)  
**Status:** Ready for Planning  
**Date:** January 15, 2026  
**Last Updated:** January 15, 2026  
**Document Type:** LIVING DOCUMENT - Updated continuously as project evolves

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase 1 Completion Status](#2-phase-1-completion-status)
3. [Phase 2: Should-Have Features](#3-phase-2-should-have-features)
4. [Phase 3: Production Readiness](#4-phase-3-production-readiness)
5. [Technical Architecture](#5-technical-architecture)
6. [Success Metrics](#6-success-metrics)
7. [Timeline & Dependencies](#7-timeline--dependencies)
8. [Risk Assessment](#8-risk-assessment)

---

## 1. Executive Summary

### 1.1 Current State
Backend Phase 1 is **100% complete** with all Must-Have features operational:
- Database models and CRUD operations
- PDF processing and text extraction
- RAG engine with vector search
- AI-powered content adaptation (Groq + Llama 3.3)
- Translation service (Google Translate - 11 Indian languages)
- Complete REST API with 15+ endpoints

### 1.2 Remaining Work
This PRD divides the remaining backend development into two phases:

**Phase 2 (Should-Have):** Product differentiation features that enhance user experience and adoption
- WhatsApp/PDF Export functionality
- Video Suggestions API
- **Timeline:** 5-7 days
- **Priority:** High (Critical for hackathon demo impact)

**Phase 3 (Production Readiness):** Optional enhancements and production-grade features
- Feedback visualization backend
- Production hardening (auth, monitoring, scaling)
- Code cleanup and optimization
- **Timeline:** 10-14 days
- **Priority:** Medium (Post-MVP, pre-production deployment)

---

## 2. Phase 1 Completion Status

### 2.1 Completed Features

| Feature | Status | Lines of Code | Documentation |
|---------|--------|---------------|---------------|
| Database Models | Complete | 150+ | Backend_Phase1_COMPLETE.md |
| Translation Service | Complete | 142 | Backend_Phase1_COMPLETE.md |
| PDF Processing | Complete | 200+ | Backend_API_Reference.md |
| RAG Engine | Complete | 162 | Backend_Phase1_COMPLETE.md |
| AI Adaptation Engine | Complete | 250+ | Backend_API_Reference.md |
| REST API Endpoints | Complete | 500+ | Backend_API_Reference.md |
| Vector Store | Complete | 162 | Backend_Phase1_COMPLETE.md |

### 2.2 API Endpoints Operational
- **Translation API:** 3 endpoints (translate, batch translate, list languages)
- **Clusters API:** 5 endpoints (CRUD + list)
- **Manuals API:** 6 endpoints (upload, index, CRUD, chunk retrieval)
- **Modules API:** 3 endpoints (generate, retrieve, list)
- **Health Check:** 1 endpoint

**Total:** 18 fully functional endpoints

---

## 3. Phase 2: Should-Have Features

**Duration:** 5-7 days  
**Priority:** High  
**Goal:** Add product differentiation features for hackathon demo impact

### 3.0 Phase 2 Overview

#### What is Phase 2?

Phase 2 focuses on **product differentiation and user experience enhancement** features that make Shiksha-Setu stand out from generic AI tools. While Phase 1 delivered the core technical functionality (RAG, AI adaptation, translation), Phase 2 adds the features that will make the platform actually usable and adoptable by government education administrators.

#### Why These Features Matter

**The Problem:** A working AI system alone doesn't guarantee adoption. Government administrators need:
1. **Easy distribution** - Teachers use WhatsApp, not web dashboards
2. **Offline access** - Low connectivity areas need PDF exports
3. **Rich content** - Text-only modules aren't engaging enough

**The Solution:** Phase 2 bridges the gap between "working prototype" and "production-ready platform" by adding three critical features that address real-world deployment challenges.

#### Phase 2 Goals & Outcomes

| Goal | Feature | Outcome |
|------|---------|---------|
| **Enable Easy Distribution** | WhatsApp Integration | Admins can send modules directly to teacher groups (30+ min → 1 min) |
| **Enable Offline Access** | PDF Export | Teachers can print/share modules without internet |
| **Enhance Engagement** | Video Suggestions | Modules include visual teaching aids automatically |

#### Phase 2 Scope

**In Scope:**
- Backend API development for 3 new features
- Database schema updates (3 new tables)
- Integration with external APIs (Twilio/WhatsApp, YouTube)
- PDF generation and file management
- Caching and quota management for external APIs

**Out of Scope:**
- Frontend UI implementation (covered in separate Frontend Phase 2 PRD)
- Production authentication (Phase 3)
- Performance optimization (Phase 3)
- Extensive testing (Phase 3)

#### Phase 2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 2 Feature Layer                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │ PDF Export     │  │ WhatsApp       │  │ Video Search   ││
│  │ Service        │  │ Service        │  │ Service        ││
│  │                │  │                │  │                ││
│  │ • ReportLab    │  │ • Twilio API   │  │ • YouTube API  ││
│  │ • File Storage │  │ • Phone Valid. │  │ • Smart Query  ││
│  │ • Auto-Cleanup │  │ • Tracking     │  │ • Caching      ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│           │                  │                    │          │
│           └──────────────────┴────────────────────┘          │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                   Phase 1 Core Layer                          │
│  (PDF Processing, RAG, AI Engine, Translation, Database)     │
└───────────────────────────────────────────────────────────────┘
```

#### Success Metrics for Phase 2

**Quantitative:**
- PDF export success rate: >95%
- WhatsApp delivery rate: >90%
- Video relevance rating: >85%
- API response time: <5 seconds (PDF), <2 seconds (videos)

**Qualitative:**
- Admins can complete full workflow (generate → export → share) without leaving platform
- Demo impact: "Wow factor" from automated video suggestions
- User feedback: "This actually saves me time"

#### Phase 2 vs Phase 3

| Aspect | Phase 2 (Should-Have) | Phase 3 (Production) |
|--------|----------------------|----------------------|
| **Focus** | Feature completeness | System reliability |
| **Priority** | High (hackathon critical) | Medium (post-MVP) |
| **Timeline** | 5-7 days | 10-14 days |
| **Deliverable** | Working demo features | Production-ready system |
| **Key Features** | Export, Share, Videos | Auth, Testing, Scaling |
| **Success Metric** | Demo impact | System uptime, security |

---

### 3.1 Feature 1: WhatsApp/PDF Export

#### 3.1.1 Business Requirements

**User Story:**  
As an Admin, I want to export generated training modules to PDF and share them directly to WhatsApp cluster groups, so teachers can receive content on their preferred communication channel without manual copy-paste.

**Problem Solved:**  
- Government teachers primarily use WhatsApp for professional communication
- Manual copy-paste is error-prone and time-consuming
- PDF format ensures content is shareable offline and printable

**Impact:**  
- Reduces distribution time from 30+ minutes to <1 minute per cluster
- Increases teacher engagement by meeting them where they are
- Enables offline access in low-connectivity areas

#### 3.1.2 Technical Requirements

##### A. PDF Export API

**Endpoint:** `POST /api/modules/{module_id}/export/pdf`

**Request:**
```json
{
  "include_original": true,
  "include_comparison": false,
  "page_size": "A4",
  "language": "hi"
}
```

**Response:**
```json
{
  "success": true,
  "pdf_url": "/api/files/download/module_123_export.pdf",
  "file_size": 245678,
  "filename": "Module_Photosynthesis_Tribal_Belt_Hindi.pdf",
  "generated_at": "2026-01-15T10:30:00Z"
}
```

**Technical Implementation:**
- **Library:** ReportLab or WeasyPrint (HTML to PDF)
- **Storage:** Local filesystem (`backend/exports/pdf/`)
- **Features:**
  - Header: Module title, cluster name, generation date
  - Section 1: Original content (optional)
  - Section 2: Adapted content (mandatory)
  - Section 3: Teaching tips and activity suggestions
  - Footer: "Generated by Shiksha-Setu" with timestamp
- **File Management:** Auto-cleanup after 24 hours or on-demand download

##### B. WhatsApp Integration API

**Endpoint:** `POST /api/modules/{module_id}/share/whatsapp`

**Request:**
```json
{
  "cluster_id": 1,
  "recipient_numbers": ["+919876543210", "+919876543211"],
  "include_pdf": true,
  "custom_message": "Dear Teachers, here is your personalized training module for this week."
}
```

**Response:**
```json
{
  "success": true,
  "messages_sent": 2,
  "delivery_status": [
    {
      "phone": "+919876543210",
      "status": "sent",
      "message_id": "wamid.xyz123"
    },
    {
      "phone": "+919876543211",
      "status": "sent",
      "message_id": "wamid.xyz456"
    }
  ],
  "pdf_attachment": "Module_Photosynthesis.pdf"
}
```

**Technical Implementation:**
- **Option 1 (MVP):** Twilio WhatsApp Business API (Sandbox for testing)
  - Free tier: 1000 messages/month
  - Setup time: 1-2 hours
  - Limitations: Requires 24-hour opt-in window
  
- **Option 2 (Recommended):** WhatsApp Business API via Meta Cloud API
  - Free tier: 1000 conversations/month
  - More reliable delivery
  - Supports media attachments up to 16MB
  
- **Option 3 (Fallback):** Generate WhatsApp Web Deep Link
  - No API required
  - Creates `https://wa.me/{phone}?text={encoded_message}`
  - Admin clicks link to open WhatsApp Web with pre-filled message
  - Lower complexity, manual but functional

**Implementation Steps:**
1. Create WhatsApp service wrapper (`services/whatsapp_service.py`)
2. Add phone number validation and formatting
3. Implement message templating system
4. Handle media attachment (PDF) uploads
5. Add delivery status tracking in database
6. Create error handling for failed deliveries

##### C. Database Schema Changes

**New Table: `exports`**
```sql
CREATE TABLE exports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    export_type VARCHAR(20) NOT NULL,  -- 'pdf', 'whatsapp', 'email'
    file_path TEXT,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    downloaded_at TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules (id)
);
```

**New Table: `whatsapp_deliveries`**
```sql
CREATE TABLE whatsapp_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    cluster_id INTEGER NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    message_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'sent', 'delivered', 'failed'
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules (id),
    FOREIGN KEY (cluster_id) REFERENCES clusters (id)
);
```

#### 3.1.3 Acceptance Criteria

- [ ] PDF export generates properly formatted A4 document with module content
- [ ] PDF includes bilingual support (English + selected Indian language)
- [ ] PDF file is downloadable via direct link within 5 seconds of generation
- [ ] WhatsApp API successfully sends text messages to test numbers
- [ ] WhatsApp API successfully sends PDF attachments up to 5MB
- [ ] System tracks delivery status for all sent messages
- [ ] Admin can view delivery report showing sent/failed messages
- [ ] Files auto-cleanup after 24 hours to prevent storage bloat
- [ ] Error handling for invalid phone numbers and API failures

#### 3.1.4 Files to Create/Modify

**New Files:**
- `backend/services/pdf_export_service.py` (~150 lines)
- `backend/services/whatsapp_service.py` (~120 lines)
- `backend/api/export.py` (~100 lines)

**Modified Files:**
- `backend/models/database_models.py` (add Export and WhatsAppDelivery models)
- `backend/schemas/api_schemas.py` (add export schemas)
- `backend/main.py` (register export router)
- `backend/requirements.txt` (add reportlab, twilio/requests)

**Estimated Lines of Code:** 400-500 lines

---

### 3.2 Feature 2: Video Suggestions API

#### 3.2.1 Business Requirements

**User Story:**  
As an Admin, I want the system to automatically suggest relevant educational videos from YouTube/public sources that match the generated module topic, so teachers get visual teaching aids without manual searching.

**Problem Solved:**
- Teachers need visual aids but lack time to search for quality videos
- Manually curating videos for each module is time-consuming
- Videos enhance understanding, especially for complex science/math topics

**Impact:**
- Saves 15-20 minutes of manual video search time per module
- Increases training module engagement with multimedia content
- Provides ready-to-use classroom resources

#### 3.2.2 Technical Requirements

##### A. Video Search API

**Endpoint:** `POST /api/videos/search`

**Request:**
```json
{
  "topic": "Photosynthesis for tribal schools without lab",
  "language": "hi",
  "max_results": 5,
  "video_duration": "short"  // short (0-4 min), medium (4-20 min), long (20+ min)
}
```

**Response:**
```json
{
  "success": true,
  "query": "Photosynthesis for tribal schools without lab",
  "total_results": 5,
  "videos": [
    {
      "video_id": "abc123xyz",
      "title": "Simple Photosynthesis Experiment at Home",
      "description": "Learn photosynthesis using household items...",
      "thumbnail_url": "https://img.youtube.com/vi/abc123xyz/mqdefault.jpg",
      "duration": "3:45",
      "channel_name": "Science Simplified",
      "view_count": 125000,
      "published_date": "2025-08-15",
      "embed_url": "https://www.youtube.com/embed/abc123xyz",
      "watch_url": "https://www.youtube.com/watch?v=abc123xyz",
      "relevance_score": 0.92
    }
  ]
}
```

##### B. Module Video Suggestions API

**Endpoint:** `GET /api/modules/{module_id}/video-suggestions`

**Query Parameters:**
- `limit` (default: 3, max: 10)
- `refresh` (boolean: force new search)

**Response:**
```json
{
  "module_id": 1,
  "module_title": "Photosynthesis - Tribal Belt Adaptation",
  "suggested_videos": [
    {
      "video_id": "abc123xyz",
      "title": "Photosynthesis Without Lab Equipment",
      "thumbnail_url": "https://img.youtube.com/vi/abc123xyz/mqdefault.jpg",
      "duration": "4:20",
      "watch_url": "https://www.youtube.com/watch?v=abc123xyz",
      "relevance_reason": "Matches low-infrastructure teaching approach"
    }
  ],
  "cached": true,
  "generated_at": "2026-01-15T10:30:00Z"
}
```

**Technical Implementation:**

**Option 1 (Recommended): YouTube Data API v3**
- **Pros:** Official API, reliable, rich metadata, free tier generous
- **Cons:** Requires API key, quota limits (10,000 units/day)
- **Setup:** 30 minutes (Google Cloud Console)
- **Cost:** Free tier sufficient for MVP (100 searches/day)

**Implementation:**
```python
# services/video_search_service.py
from googleapiclient.discovery import build
from core.config import settings

class VideoSearchService:
    def __init__(self):
        self.youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)
    
    async def search_videos(self, query: str, language: str = 'en', max_results: int = 5):
        """Search YouTube for educational videos"""
        request = self.youtube.search().list(
            q=query,
            part='snippet',
            type='video',
            videoEmbeddable='true',
            safeSearch='strict',
            relevanceLanguage=language,
            maxResults=max_results,
            videoDuration='short'  # 0-4 minutes
        )
        response = request.execute()
        return self._parse_results(response)
```

**Option 2 (Fallback): Web Scraping YouTube**
- **Pros:** No API key needed, no quota limits
- **Cons:** Against YouTube TOS, unreliable, may break
- **Not Recommended** for production

**Option 3 (Alternative): DailyMotion/Vimeo APIs**
- Backup option if YouTube API quota exceeded
- Smaller educational content library

##### C. Smart Query Generation

Use AI to generate optimized video search queries:

```python
# In services/video_search_service.py
async def generate_search_query(self, module_content: str, cluster_profile: dict):
    """Generate optimal YouTube search query from module content"""
    prompt = f"""
    Given this training module content: "{module_content[:200]}..."
    And cluster profile: {cluster_profile}
    
    Generate a concise YouTube search query (max 60 characters) that will find the most relevant 
    educational videos. Focus on:
    1. Core topic/concept
    2. Teaching level (primary/secondary)
    3. Special constraints (low-resource, vernacular)
    
    Output only the search query, nothing else.
    """
    
    response = await ai_engine.query(prompt)
    return response.strip()
```

##### D. Video Caching Strategy

**Database Schema:**
```sql
CREATE TABLE video_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    video_id VARCHAR(50) NOT NULL,
    video_title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration VARCHAR(10),
    channel_name VARCHAR(100),
    relevance_score FLOAT,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules (id)
);
```

**Caching Logic:**
- Cache video suggestions for 7 days per module
- Refresh cache if `refresh=true` parameter sent
- Fallback to cached results if API quota exceeded

#### 3.2.3 Acceptance Criteria

- [ ] YouTube Data API successfully integrated and authenticated
- [ ] Video search returns 3-5 relevant videos within 2 seconds
- [ ] Results filtered for educational content (safe search enabled)
- [ ] Video metadata includes title, thumbnail, duration, watch URL
- [ ] Module-specific suggestions cached for 7 days
- [ ] System gracefully handles API quota exhaustion (returns cached results)
- [ ] Video suggestions display in frontend with thumbnails and links
- [ ] Admin can manually refresh video suggestions
- [ ] System logs API usage for quota monitoring

#### 3.2.4 Files to Create/Modify

**New Files:**
- `backend/services/video_search_service.py` (~180 lines)
- `backend/api/videos.py` (~80 lines)

**Modified Files:**
- `backend/models/database_models.py` (add VideoSuggestion model)
- `backend/schemas/api_schemas.py` (add video schemas)
- `backend/main.py` (register videos router)
- `backend/requirements.txt` (add google-api-python-client)
- `backend/.env.example` (add YOUTUBE_API_KEY)

**Estimated Lines of Code:** 280-320 lines

---

### 3.3 Phase 2 Summary

| Feature | Priority | Complexity | LOC | Timeline | Dependencies |
|---------|----------|------------|-----|----------|--------------|
| PDF Export | High | Medium | 150 | 2 days | ReportLab |
| WhatsApp Integration | High | Medium | 250 | 2-3 days | Twilio/Meta API |
| Video Suggestions | Medium | Low | 300 | 2 days | YouTube API |
| **Total** | - | - | **700** | **5-7 days** | - |

**Total Estimated Effort:** 5-7 working days  
**Team Size:** 1-2 backend developers  
**Risk Level:** Low (well-documented APIs, clear requirements)

---

## 4. Phase 3: Production Readiness

**Duration:** 10-14 days  
**Priority:** Medium (Post-MVP)  
**Goal:** Prepare system for production deployment with enterprise-grade features

### 4.1 Feature 1: Feedback Visualization Backend

#### 4.1.1 Business Requirements

**User Story:**  
As an Admin, I want to see aggregated teacher feedback analytics in visual charts, so I can identify which modules are most effective and iterate quickly.

**Current State:**
- Feedback collection API exists (`POST /api/modules/{module_id}/feedback`)
- Database stores individual feedback records
- No aggregation or analytics endpoints

#### 4.1.2 Technical Requirements

**New Endpoints:**

##### A. Feedback Analytics API

**Endpoint:** `GET /api/analytics/feedback/summary`

**Query Parameters:**
- `cluster_id` (optional)
- `manual_id` (optional)
- `date_from` (optional)
- `date_to` (optional)

**Response:**
```json
{
  "total_feedback": 156,
  "helpful_count": 132,
  "not_helpful_count": 24,
  "helpfulness_rate": 0.846,
  "average_rating": 4.2,
  "feedback_by_cluster": [
    {
      "cluster_id": 1,
      "cluster_name": "Tribal Belt",
      "total": 45,
      "helpful": 38,
      "rate": 0.844
    }
  ],
  "feedback_over_time": [
    {
      "date": "2026-01-10",
      "helpful": 12,
      "not_helpful": 3
    }
  ],
  "common_issues": [
    "Too technical for primary teachers",
    "Need more examples",
    "Translation quality issues"
  ]
}
```

##### B. Module Performance API

**Endpoint:** `GET /api/analytics/modules/performance`

**Response:**
```json
{
  "top_modules": [
    {
      "module_id": 5,
      "title": "Photosynthesis - Tribal Adaptation",
      "helpfulness_rate": 0.92,
      "feedback_count": 35,
      "avg_rating": 4.5
    }
  ],
  "underperforming_modules": [
    {
      "module_id": 12,
      "title": "Newton's Laws - Urban",
      "helpfulness_rate": 0.43,
      "feedback_count": 28,
      "avg_rating": 2.8
    }
  ]
}
```

#### 4.1.3 Implementation

**New Files:**
- `backend/api/analytics.py` (~150 lines)
- `backend/services/analytics_service.py` (~200 lines)

**Database Indexes:**
```sql
CREATE INDEX idx_feedback_module ON feedback(module_id);
CREATE INDEX idx_feedback_cluster ON feedback(cluster_id);
CREATE INDEX idx_feedback_created ON feedback(created_at);
```

**Estimated LOC:** 350 lines

---

### 4.2 Feature 2: Authentication & Authorization

#### 4.2.1 Business Requirements

**User Story:**  
As a System Admin, I want secure authentication so only authorized administrators can access the platform and manage training content.

**Current State:** No authentication (MVP only)

#### 4.2.2 Technical Requirements

**Implementation Options:**

##### Option 1: JWT-based Authentication
```python
# POST /api/auth/login
{
  "username": "dr.kumar@diet.gov.in",
  "password": "SecurePass123!"
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "username": "dr.kumar@diet.gov.in",
    "role": "admin",
    "full_name": "Dr. Kumar"
  }
}
```

**Features:**
- Password hashing (bcrypt)
- JWT tokens with 1-hour expiry
- Refresh token mechanism
- Role-based access control (admin, coordinator, viewer)
- Protected endpoints with `@require_auth` decorator

**Implementation:**
- Library: `python-jose[cryptography]`, `passlib[bcrypt]`
- Files: `services/auth_service.py`, `api/auth.py`, `core/security.py`
- **LOC:** 400 lines

##### Option 2: OAuth 2.0 (Google SSO)
- Simpler for government users (use existing @gov.in emails)
- No password management burden
- Library: `authlib`
- **LOC:** 300 lines

**Recommended:** Start with JWT (Option 1), add OAuth later

#### 4.2.3 Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    role VARCHAR(20) DEFAULT 'viewer',  -- admin, coordinator, viewer
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

---

### 4.3 Feature 3: Production Database Migration

#### 4.3.1 Business Requirements

**Current State:** SQLite (file-based, single-user)  
**Production Need:** PostgreSQL/MySQL (concurrent users, transactions, backups)

#### 4.3.2 Migration Plan

**Step 1: Database Abstraction**
- Already using SQLAlchemy ORM (database-agnostic)
- No code changes needed for models

**Step 2: Connection String Update**
```python
# Development (SQLite)
DATABASE_URL = "sqlite:///./shiksha_setu.db"

# Production (PostgreSQL)
DATABASE_URL = "postgresql://user:password@localhost:5432/shiksha_setu"
```

**Step 3: Migration Tool**
- Use Alembic for schema versioning
- Create migration scripts for all tables
- Test migration on staging environment

**Implementation:**
- Install: `alembic`, `psycopg2-binary` (PostgreSQL driver)
- Create: `alembic/` directory with migration scripts
- **LOC:** 200 lines (migration scripts)

---

### 4.4 Feature 4: Error Monitoring & Logging

#### 4.4.1 Requirements

**Current State:** Basic Python logging  
**Production Need:** Centralized error tracking, performance monitoring

#### 4.4.2 Implementation

**Option 1: Sentry (Recommended)**
- Automatic error capture
- Stack traces with context
- Performance monitoring
- Free tier: 5,000 errors/month

```python
# In main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastAPIIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastAPIIntegration()],
    traces_sample_rate=1.0,
)
```

**Option 2: ELK Stack (Self-hosted)**
- Elasticsearch + Logstash + Kibana
- Full log aggregation
- More complex setup

**Recommended:** Start with Sentry

**Implementation:**
- Library: `sentry-sdk[fastapi]`
- **LOC:** 50 lines

---

### 4.5 Feature 5: API Rate Limiting & Caching

#### 4.5.1 Rate Limiting

**Prevent API abuse:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/translate")
@limiter.limit("10/minute")  # Max 10 translations per minute per IP
async def translate_text(request: TranslationRequest):
    ...
```

**Implementation:**
- Library: `slowapi`
- **LOC:** 100 lines

#### 4.5.2 Redis Caching

**Cache expensive operations:**
- Translation results (cache for 7 days)
- Video search results (cache for 24 hours)
- RAG search results (cache for 1 hour)

```python
from redis import Redis
import json

redis_client = Redis(host='localhost', port=6379, decode_responses=True)

async def get_translation(text: str, target_lang: str):
    cache_key = f"translation:{text}:{target_lang}"
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    result = await translator.translate(text, target_lang)
    redis_client.setex(cache_key, 604800, json.dumps(result))  # 7 days
    return result
```

**Implementation:**
- Library: `redis`, `aioredis`
- **LOC:** 200 lines

---

### 4.6 Feature 6: API Versioning

**Current:** All endpoints under `/api/`  
**Production:** Version endpoints for backward compatibility

```python
# Old clients still work
@app.include_router(translation_router, prefix="/api/v1")

# New features/breaking changes
@app.include_router(translation_router_v2, prefix="/api/v2")
```

**Implementation:**
- Duplicate routers for v1/v2
- Document deprecation timeline
- **LOC:** 100 lines

---

### 4.7 Feature 7: Automated Testing

#### 4.7.1 Unit Tests

**Current:** Manual testing only  
**Production Need:** Automated test suite

```python
# tests/test_translation_service.py
import pytest
from services.translation_service import TranslationService

@pytest.mark.asyncio
async def test_translate_english_to_hindi():
    service = TranslationService()
    result = await service.translate("Hello", "hi")
    assert result == "नमस्ते"
```

**Coverage Goals:**
- Services: 80%+ coverage
- API endpoints: 70%+ coverage
- Database models: 60%+ coverage

**Implementation:**
- Library: `pytest`, `pytest-asyncio`, `pytest-cov`
- Create: `tests/` directory with test files
- **LOC:** 800 lines

#### 4.7.2 Integration Tests

```python
# tests/test_api_integration.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_module_generation_flow():
    # 1. Create cluster
    cluster_response = client.post("/api/clusters", json={...})
    cluster_id = cluster_response.json()["id"]
    
    # 2. Upload manual
    manual_response = client.post("/api/manuals", files={...})
    manual_id = manual_response.json()["id"]
    
    # 3. Generate module
    module_response = client.post("/api/modules/generate", json={
        "manual_id": manual_id,
        "cluster_id": cluster_id,
        ...
    })
    
    assert module_response.status_code == 201
```

---

### 4.8 Feature 8: Code Cleanup & Optimization

#### 4.8.1 Delete Unused Files

**Files to Remove:**
- `backend/models/indictrans2/` (4.46GB - unused IndicTrans2 model)
- `backend/services/translation_service_old.py`
- `backend/tests/test_translation_*.py` (old test files)
- `backend/test_chromadb.py`
- `backend/test_quick.py`

**Estimated Storage Saved:** ~4.5GB

#### 4.8.2 Code Refactoring

**Target Areas:**
- Extract repeated database query patterns into repository classes
- Split large files (>500 lines) into smaller modules
- Add comprehensive docstrings to all public functions
- Type hints for all function parameters and returns

**Example:**
```python
# Before: Direct DB queries in API routes
@router.get("/clusters/{cluster_id}")
async def get_cluster(cluster_id: int, db: Session = Depends(get_db)):
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    return cluster

# After: Repository pattern
class ClusterRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, cluster_id: int) -> Optional[Cluster]:
        return self.db.query(Cluster).filter(Cluster.id == cluster_id).first()

@router.get("/clusters/{cluster_id}")
async def get_cluster(cluster_id: int, repo: ClusterRepository = Depends()):
    cluster = repo.get_by_id(cluster_id)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    return cluster
```

---

### 4.9 Phase 3 Summary

| Feature | Priority | Complexity | LOC | Timeline | Status |
|---------|----------|------------|-----|----------|--------|
| Feedback Analytics | Low | Low | 350 | 2 days | Optional |
| Authentication | High | Medium | 400 | 3 days | Required |
| Database Migration | High | Medium | 200 | 2 days | Required |
| Error Monitoring | Medium | Low | 50 | 1 day | Recommended |
| Rate Limiting | Medium | Low | 100 | 1 day | Recommended |
| Redis Caching | Low | Medium | 200 | 1-2 days | Optional |
| API Versioning | Low | Low | 100 | 1 day | Optional |
| Automated Testing | Medium | High | 800 | 3-4 days | Recommended |
| Code Cleanup | Low | Low | - | 1 day | Optional |
| **Total** | - | - | **2200** | **10-14 days** | - |

**Priority Breakdown:**
- **Must-Have (Required):** Authentication, Database Migration (5 days)
- **Should-Have (Recommended):** Error Monitoring, Rate Limiting, Testing (5-6 days)
- **Could-Have (Optional):** Feedback Analytics, Caching, Versioning, Cleanup (3-4 days)

---

## 5. Technical Architecture

### 5.1 System Architecture After All Phases

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  - Admin Dashboard  - Module Comparison  - Analytics     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / REST API
┌────────────────────▼────────────────────────────────────┐
│              API Gateway (FastAPI)                       │
│  - Rate Limiting  - Authentication  - API Versioning     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Business Logic Layer                    │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│ │ PDF Service  │  │ Translation  │  │ AI Engine    │   │
│ │              │  │ Service      │  │ (Groq)       │   │
│ └──────────────┘  └──────────────┘  └──────────────┘   │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│ │ RAG Engine   │  │ WhatsApp     │  │ Video Search │   │
│ │              │  │ Service      │  │ Service      │   │
│ └──────────────┘  └──────────────┘  └──────────────┘   │
│ ┌──────────────┐  ┌──────────────┐                     │
│ │ PDF Export   │  │ Analytics    │                     │
│ │ Service      │  │ Service      │                     │
│ └──────────────┘  └──────────────┘                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Data Layer                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│ │ PostgreSQL   │  │ Redis Cache  │  │ Vector Store │   │
│ │ (Main DB)    │  │              │  │ (Embeddings) │   │
│ └──────────────┘  └──────────────┘  └──────────────┘   │
│ ┌──────────────┐  ┌──────────────┐                     │
│ │ File Storage │  │ Sentry       │                     │
│ │ (PDFs/Exports)│  │ (Monitoring) │                     │
│ └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack Additions

**Phase 2:**
- ReportLab (PDF generation)
- Twilio/WhatsApp Business API (messaging)
- YouTube Data API v3 (video search)

**Phase 3:**
- PostgreSQL (production database)
- Redis (caching layer)
- Sentry (error monitoring)
- Alembic (database migrations)
- pytest (testing framework)
- slowapi (rate limiting)
- python-jose (JWT authentication)
- passlib (password hashing)

---

## 6. Success Metrics

### 6.1 Phase 2 Success Criteria

**PDF Export:**
- [ ] 95%+ of PDF exports complete successfully within 5 seconds
- [ ] PDFs are properly formatted with bilingual content
- [ ] Zero file corruption reports

**WhatsApp Integration:**
- [ ] 90%+ message delivery success rate
- [ ] <10% API failure rate
- [ ] Average delivery time <30 seconds

**Video Suggestions:**
- [ ] 85%+ of suggested videos rated as "relevant" by admins
- [ ] API response time <2 seconds
- [ ] <5% API quota exhaustion incidents

### 6.2 Phase 3 Success Criteria

**Authentication:**
- [ ] Zero unauthorized access incidents
- [ ] Login success rate >99%
- [ ] Password reset flow tested and functional

**Performance:**
- [ ] API response time <500ms (p95)
- [ ] Database query time <100ms (p95)
- [ ] Cache hit rate >80% for translations

**Reliability:**
- [ ] System uptime >99.5%
- [ ] Error rate <0.5%
- [ ] Zero data loss incidents

**Testing:**
- [ ] Test coverage >70%
- [ ] All critical paths covered by integration tests
- [ ] CI/CD pipeline runs tests automatically

---

## 7. Timeline & Dependencies

### 7.1 Development Timeline

```
Week 1: Phase 2 Development
├── Day 1-2: PDF Export Service
├── Day 3-4: WhatsApp Integration
├── Day 5-6: Video Suggestions API
└── Day 7: Testing & Documentation

Week 2-3: Phase 3 Development (Optional)
├── Day 8-10: Authentication & Database Migration
├── Day 11-12: Error Monitoring & Rate Limiting
├── Day 13-16: Automated Testing Suite
└── Day 17-18: Code Cleanup & Optimization
```

### 7.2 External Dependencies

**Phase 2:**
- Twilio Account setup (30 minutes)
- WhatsApp Business API approval (1-3 days)
- YouTube API key creation (30 minutes)
- Google Cloud Console project setup (1 hour)

**Phase 3:**
- Sentry account creation (15 minutes)
- PostgreSQL installation/hosting (varies)
- Redis installation/hosting (varies)
- SSL certificate for production (1-2 days)

### 7.3 Prerequisites

**Before Phase 2:**
- [ ] Phase 1 backend fully tested and stable
- [ ] Frontend Phase 2 in progress or complete
- [ ] External API accounts created (Twilio, YouTube)
- [ ] Environment variables documented

**Before Phase 3:**
- [ ] Phase 2 features tested and merged
- [ ] Production hosting environment identified
- [ ] Database backup strategy defined
- [ ] Security audit checklist prepared

---

## 8. Risk Assessment

### 8.1 Phase 2 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WhatsApp API quota exhaustion | Medium | High | Implement queue system, use fallback deep links |
| YouTube API blocked in schools | Low | Medium | Fallback to DailyMotion/Vimeo APIs |
| PDF generation memory issues | Low | Medium | Stream large PDFs, limit page count |
| Twilio sandbox limitations | High | Low | Document upgrade path to production API |

### 8.2 Phase 3 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database migration data loss | Low | Critical | Comprehensive backup, test on staging first |
| Authentication bypass vulnerabilities | Low | Critical | Security audit, penetration testing |
| Performance degradation under load | Medium | High | Load testing, horizontal scaling plan |
| Breaking changes during refactoring | Medium | Medium | Comprehensive test coverage before refactor |

---

## 9. Phase Implementation Order

### 9.1 Recommended Sequence

**Immediate (Phase 2):**
1. PDF Export (independent feature, high value)
2. Video Suggestions (independent feature, demo impact)
3. WhatsApp Integration (depends on external approval, start early)

**Post-MVP (Phase 3 - Priority Order):**
1. Authentication (security critical)
2. Database Migration (scalability critical)
3. Error Monitoring (operational visibility)
4. Automated Testing (quality assurance)
5. Rate Limiting (abuse prevention)
6. Remaining features (as needed)

### 9.2 Parallel Development Opportunities

**Can be developed simultaneously:**
- PDF Export + Video Suggestions (no shared dependencies)
- Authentication + Database Migration (separate concerns)
- Testing + Code Cleanup (different team members)

**Must be sequential:**
- Database Migration → Redis Caching (caching depends on DB schema)
- Authentication → Rate Limiting (rate limits can be per-user)

---

## 10. Appendix

### 10.1 API Endpoint Summary

**Phase 2 New Endpoints:**
```
POST   /api/modules/{module_id}/export/pdf
POST   /api/modules/{module_id}/share/whatsapp
POST   /api/videos/search
GET    /api/videos/languages
GET    /api/modules/{module_id}/video-suggestions
```

**Phase 3 New Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/analytics/feedback/summary
GET    /api/analytics/modules/performance
GET    /api/health/detailed
```

### 10.2 Environment Variables

**Phase 2 Additions:**
```env
# WhatsApp/Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886

# YouTube API
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
YOUTUBE_API_QUOTA_LIMIT=10000
```

**Phase 3 Additions:**
```env
# Authentication
JWT_SECRET_KEY=your-secret-key-min-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Production Database
DATABASE_URL=postgresql://user:pass@localhost:5432/shiksha_setu
DATABASE_POOL_SIZE=20

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
```

### 10.3 File Structure After All Phases

```
backend/
├── api/
│   ├── auth.py              [NEW - Phase 3]
│   ├── analytics.py         [NEW - Phase 3]
│   ├── export.py            [NEW - Phase 2]
│   ├── videos.py            [NEW - Phase 2]
│   ├── clusters.py
│   ├── manuals.py
│   ├── modules.py
│   └── translation.py
├── core/
│   ├── security.py          [NEW - Phase 3]
│   ├── cache.py             [NEW - Phase 3]
│   ├── config.py
│   ├── database.py
│   └── vector_store.py
├── models/
│   ├── database_models.py   [UPDATED - new tables]
│   └── __init__.py
├── schemas/
│   ├── auth.py              [NEW - Phase 3]
│   ├── export.py            [NEW - Phase 2]
│   ├── video.py             [NEW - Phase 2]
│   ├── analytics.py         [NEW - Phase 3]
│   ├── api_schemas.py
│   └── __init__.py
├── services/
│   ├── auth_service.py      [NEW - Phase 3]
│   ├── pdf_export_service.py [NEW - Phase 2]
│   ├── whatsapp_service.py  [NEW - Phase 2]
│   ├── video_search_service.py [NEW - Phase 2]
│   ├── analytics_service.py [NEW - Phase 3]
│   ├── cache_service.py     [NEW - Phase 3]
│   ├── ai_engine.py
│   ├── pdf_processor.py
│   ├── rag_engine.py
│   ├── translation_service.py
│   └── __init__.py
├── tests/
│   ├── test_auth.py         [NEW - Phase 3]
│   ├── test_export.py       [NEW - Phase 2]
│   ├── test_videos.py       [NEW - Phase 2]
│   ├── test_analytics.py    [NEW - Phase 3]
│   ├── test_integration.py  [NEW - Phase 3]
│   └── conftest.py          [NEW - Phase 3]
├── alembic/                 [NEW - Phase 3]
│   ├── versions/
│   └── env.py
├── exports/                 [NEW - Phase 2]
│   └── pdf/
├── main.py
├── requirements.txt         [UPDATED]
├── .env.example             [UPDATED]
└── README.md
```

---

## 11. Next Steps

### 11.1 Immediate Actions

**For Phase 2 Start:**
1. [ ] Create external API accounts (Twilio, YouTube)
2. [ ] Update `requirements.txt` with Phase 2 dependencies
3. [ ] Create `/exports/pdf/` directory
4. [ ] Review and approve this PRD
5. [ ] Create GitHub issues for each Phase 2 feature
6. [ ] Set up development branch: `backend-phase2`

**For Phase 3 Planning:**
1. [ ] Identify production hosting provider (AWS/Azure/GCP)
2. [ ] Create Sentry account for error monitoring
3. [ ] Set up staging environment for testing
4. [ ] Schedule security audit after authentication implementation
5. [ ] Define database backup and disaster recovery strategy

### 11.2 Documentation Updates Required

After Phase 2 completion:
- [ ] Update `Backend_API_Reference.md` with new endpoints
- [ ] Update `Backend_Phase1_COMPLETE.md` to `Backend_Phase2_COMPLETE.md`
- [ ] Update main PRD with Phase 2 feature status
- [ ] Create API usage examples for WhatsApp and Video APIs
- [ ] Document external API setup procedures

After Phase 3 completion:
- [ ] Create `Production_Deployment_Guide.md`
- [ ] Create `Security_Best_Practices.md`
- [ ] Document database migration procedures
- [ ] Create `Testing_Strategy.md`
- [ ] Update all PRDs with "Last Updated" timestamps

---

## 12. Approval & Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | - | - | - |
| Backend Lead | - | - | - |
| Technical Architect | - | - | - |

---

**Document Status:** Ready for Review  
**Next Review Date:** After Phase 2 completion  
**Document Owner:** Backend Development Team  

**Last Updated:** January 15, 2026

---

**End of Document**
