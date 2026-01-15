# **Shiksha-Setu — Developer Task Breakdown**

**Last Updated:** January 15, 2026

## **BUILD STRATEGY (Read This First)**

Golden rule: If time runs out, the demo must still work end-to-end.  
The absolute priority is: PDF → Cluster → AI Adaptation → Side-by-Side View. Everything else is secondary.

## **PHASE 0 — Project Setup (Day 0 / Hour 0–2)**

### **Core Setup**

* [x] **Create Git repo** (frontend + backend folders)  
* [x] **Decide stack**  
  * Backend: Python (FastAPI) ✅
  * Frontend: React + Vite ✅
* [x] **Define .env** for API keys (Groq, Translation)

### **Architecture Decisions**

* [x] **Decide RAG flow** (PDF → chunks → vector DB → retrieval) - SimpleVectorStore implemented
* [x] **Decide prompt structure** (base + cluster constraints)

**Output:** ✅ Repo boots locally without err ✅ COMPLETE

### **1️⃣ PDF Ingestion & RAG Pipeline** ✅

**Owner:** Backend Dev

* [x] Create **Upload PDF** endpoint (`POST /api/manuals`)
* [x] Implement **Extract text** (PyPDF2 + PDFPlumber)  
* [x] Implement **Chunk text** (logical chunks, not random)  
* [x] **Store embeddings** in SimpleVectorStore (sentence-transformers)
* [x] Test **retrieval** of correct sections by query (`POST /api/manuals/{id}/search`)

**Acceptance check:** ✅ You can query "photosynthesis" and get the right manual content.

### **2️⃣ Cluster Profile Builder** ✅

**Owner:** Backend Dev / Full-Stack

* [x] **Define Cluster schema:**  
  * Name  
  * Geographic type
  * Language  
  * Infrastructure constraints  
  * Key issues (specific_challenges field)
  * Total teachers
* [x] Create **CRUD APIs** for clusters (5 endpoints)
* [x] **Persist clusters** (SQLite with SQLAlchemy ORM)

**Acceptance check:** ✅ You can create at least 2 clusters with different constraints.

### **3️⃣ Pedagogical Adaptation Engine (AI Core)** ✅

**Owner:** AI / Backend Dev

* [x] **Design base prompt** (grounded, policy-safe)  
* [x] **Inject Context:**  
  * Retrieved manual content  
  * Cluster constraints  
* [x] Integrate **Groq (Llama 3.3-70B)** call  
* [x] **Generate adapted module text** (`POST /api/modules/generate`)
* [x] **Enforce Safety:**  
  * No unsafe activities  
  * No hallucinated content

**Acceptance check:** ✅ Same input → different outputs for different clusters.

### **4️⃣ TransBackend Should-Have Features (5-7 days)**

### **6️⃣ PDF Export Service**

**Owner:** Backend Dev

* [ ] Install **ReportLab** or **WeasyPrint** library
* [ ] Create `services/pdf_export_service.py`
* [ ] Implement `POST /api/modules/{module_id}/export/pdf` endpoint
* [ ] Generate formatted PDFs with:
  * Module title and metadata
  * Original content (optional)
  * Adapted content
  * Bilingual support
* [ ] File storage in `backend/exports/pdf/`
* [ ] Auto-cleanup after 24 hours
* [ ] Create Export database model

**Acceptance check:** PDF exports within 5 seconds, properly formatted with bilingual content.

**Estimated:** 150 LOC, 2 days

### **7️⃣ WhatsApp Integration**

**Owner:** Backend Dev

* [ ] Set up **Twilio WhatsApp Business API** account
* [ ] Create `services/whatsapp_service.py`
* [ ] Implement `POST /api/modules/{module_id}/share/whatsapp` endpoint
* [ ] Phone number validation and formatting
* [ ] Message templating system
* [ ] PDF attachment support (up to 16MB)
* [ ] Delivery status tracking
* [ ] Create WhatsAppDelivery database model
* [ ] Error handling for failed deliveries

**Acceptance check:** Messages and PDFs successfully sent to test numbers with 90%+ delivery rate.

**Estimated:** 250 LOC, 2-3 days

### **8️⃣ Video Suggestions API**

**Owner:** Backend Dev

* [ ] Set up **YouTube Data API v3** key (Google Cloud Console)
* [ ] Create `services/video_search_service.py`
* [ ] Implement `POST /api/videos/search` endpoint
* [ ] Implement `GET /api/modules/{module_id}/video-suggestions` endpoint
* [ ] Smart query generation using AI
* [ ] Video caching strategy (7 days)
* [ ] Create VideoSuggestion database model
* [ ] Filter for educational content (safe search)
* [ ] API quota monitoring

**Acceptance check:** Relevant video suggestions return within 2 seconds, 85%+ relevance rate.

**Estimated:** 300 LOC, 2 days
Backend Production Readiness (10-14 days)**

### **1️⃣1️⃣ Authentication & Authorization** (REQUIRED)

**Owner:** Backend Dev

* [ ] Install `python-jose`, `passlib[bcrypt]`
* [ ] Create `services/auth_service.py` and `core/security.py`
* [ ] Implement `POST /api/auth/login` endpoint
* [ ] Implement `POST /api/auth/refresh` endpoint
* [ ] JWT token generation (1-hour expiry)
* [ ] Password hashing with bcrypt
* [ ] Role-based access control (admin, coordinator, viewer)
* [ ] Protected endpoints with `@require_auth` decorator
* [ ] Create User and RefreshToken database models

**Acceptance check:** Secure login with JWT tokens, protected routes work correctly.

**Estimated:** 400 LOFeatures (ONLY If Everything Else Works)**

### **2️⃣1️⃣ Feedback Loop Visualization** (Could-Have)

**Owner:** Frontend + Backend

* [x] **Define feedback schema** (Already in database)
* [ ] **Backend analytics API** (Phase 3 optional)
* [ ] **Frontend Chart.js integration**
* [ ] Render aggregated feedback charts
* [ ] Module performance dashboard

**Important:** No teacher names. No ranking.

### **2️⃣2️⃣ Video Suggestions UI** (If Phase 2 Backend Complete)

**Owner:** Frontend

* [ ] Integrate video search API
* [ ] Display video thumbnails
* [ ] YouTube embed player
* [ ] Video relevance indicators
* [ ] Manual refresh button

## **PHASE 5 — Safety, Polish & Demo Prep**

### **2️⃣3️⃣ Guardrails & Ethics**

* [x] Add **Human-in-the-loop** approval toggle (implicit in generate flow)
* [x] Design **safety prompts** in AI engine (policy-safe prompts)
* [ ] Add clear **disclaimer** in UI: "AI-assisted draft - requires review"
* [ ] Content validation warnings

### **2️⃣4️⃣ Demo Scenario Preparation (CRITICAL)**

* [ ] Choose **1 chapter** (e.g., Photosynthesis)  
* [ ] Prepare **3 clusters**:  
  1. Tribal / Language barrier  
  2. No-lab rural school  
  3. Urban high-performing cluster  
* [ ] **Pre-generate outputs** (backup plan)
* [ ] Test all demo flows end-to-end
* [ ] Prepare fallback data if APIs fail
* [ ] Create demo script/presentation

**Note:** This prevents live-demo failure.

---

## **Progress Summary**

| Phase | Status | Progress | Priority |
|-------|--------|----------|----------|
| Phase 0: Project Setup | ✅ Complete | 100% | Critical |
| Phase 1: Backend Core | ✅ Complete | 100% | Critical |
| Phase 2: Backend Features | 📋 Planned | 0% | High |
| Phase 2: Frontend MVP | 🔄 In Progress | ~10% | Critical |
| Phase 3: Backend Production | 📋 Planned | 0% | Medium |
| Phase 3: Frontend Polish | ⏳ Pending | 0% | Low |
| Phase 4: Bonus Features | ⏳ Pending | 0% | Optional |
| Phase 5: Demo Prep | ⏳ Pending | 0% | Critical |

**Next Immediate Actions:**
1. Complete Frontend Phase 2 development (React dashboard)
2. Plan Backend Phase 2 features (PDF, WhatsApp, Videos)
3. Begin demo scenario preparation

**Critical Path for Hackathon:**
- ✅ Backend API (Complete)
- 🔄 Frontend Dashboard (In Progress) 
- 📋 Demo Preparation (Not Started)

### **1️⃣4️⃣ Rate Limiting & Caching** (RECOMMENDED)

**Owner:** Backend Dev

* [ ] Install `slowapi` (rate limiting)
* [ ] Install `redis`, `aioredis` (caching)
* [ ] Implement rate limits on API endpoints (10/min for translations)
* [ ] Create `services/cache_service.py`
* [ ] Cache translations (7 days)
* [ ] Cache video search results (24 hours)
* [ ] Cache RAG results (1 hour)
* [ ] Redis connection pooling

**Acceptance check:** Rate limits enforced, cache hit rate >80%.

**Estimated:** 300 LOC, 2 days

### **1️⃣5️⃣ Automated Testing Suite** (RECOMMENDED)

**Owner:** Backend Dev

* [ ] Install `pytest`, `pytest-asyncio`, `pytest-cov`
* [ ] Create `tests/` directory structure
* [ ] Unit tests for services (80%+ coverage)
* [ ] Integration tests for API endpoints (70%+ coverage)
* [ ] Database model tests (60%+ coverage)
* [ ] Mock external APIs (Groq, YouTube, Twilio)
* [ ] CI/CD pipeline integration

**Acceptance check:** Test suite runs successfully, coverage targets met.

**Estimated:** 800 LOC, 3-4 days

### **1️⃣6️⃣ Feedback Analytics Backend** (OPTIONAL)

**Owner:** Backend Dev

* [ ] Create `services/analytics_service.py`
* [ ] Implement `GET /api/analytics/feedback/summary` endpoint
* [ ] Implement `GET /api/analytics/modules/performance` endpoint
* [ ] Aggregate feedback data by cluster, date, module
* [ ] Calculate helpfulness rates and trends
* [ ] Database indexes for performance

**Acceptance check:** Analytics endpoints return aggregated data within 1 second.

**Estimated:** 350 LOC, 2 days

### **1️⃣7️⃣ API Versioning** (OPTIONAL)

**Owner:** Backend Dev

* [ ] Implement `/api/v1/` prefix for all endpoints
* [ ] Create versioning strategy documentation
* [ ] Plan for `/api/v2/` backward compatibility
* [ ] Version deprecation timeline

**Acceptance check:** API versioning structure in place.

**Estimated:** 100 LOC, 1 day

### **1️⃣8️⃣ Code Cleanup & Optimization** (OPTIONAL)

**Owner:** Backend Dev

* [ ] Delete unused IndicTrans2 model folder (4.46GB)
* [ ] Delete old test files (`test_translation_*.py`)
* [ ] Refactor into repository pattern
* [ ] Add comprehensive docstrings
* [ ] Add type hints to all functions
* [ ] Split large files (>500 lines)

**Acceptance check:** Codebase clean, well-documented, ~4.5GB storage saved.

**Estimated:** 1 day

---

**Phase 3 Status:** 📋 **Planned** - Production readiness and optional enhancements

## **PHASE 3 — Frontend Differentiators (ONLY If Time Allows)**

### **1️⃣9️⃣ Multilingual Output**

* [ ] Integrate **translation API** from backend
* [ ] Translate adapted module in UI
* [ ] Add **Language Toggle** in UI
* [ ] Real-time translation preview

**Note:** Backend translation already implemented.

### **2️⃣0️⃣ Export & Share Features**

* [ ] PDF download button with preview
* [ ] WhatsApp share button with phone input
* [ ] Show **delivery confirmation** message
* [ ] Export history view

**Note:** Backend APIs ready for integration
**Acceptance check:** Admin can visually compare original vs adapted content.

### **🔟
* [x] Design database schema (4 tables: clusters, manuals, modules, feedback)
* [x] Implement SQLAlchemy ORM models
* [x] Create database initialization script
* [x] Test CRUD operations

**Acceptance check:** ✅ All database operations working correctly.

---

**Phase 1 Status:** ✅ **100% COMPLETE** - All Must-Have features operational (18 API endpoints)

**Acceptance check:** Same input → different outputs for different clusters.

## **PHASE 2 — Frontend MVP (MVP CRITICAL)**

### **4️⃣ Admin "Command Center" UI**

**Owner:** Frontend Dev

* [ ] **Build Layout:**  
  * Sidebar (Uploads, Clusters, Modules)  
  * Main split screen  
* [ ] **Left Panel:** PDF viewer / original text panel  
* [ ] **Right Panel:** Adapted content editor panel

**Acceptance check:** Admin can visually compare original vs adapted content.

### **5️⃣ Generate Flow (End-to-End)**

**Owner:** Full-Stack

* [ ] **Selection UI:**  
  * Manual  
  * Cluster  
  * Lesson / topic  
* [ ] **"Generate Adaptation"** Action  
  * Show loading state  
  * Show success state  
* [ ] **Display output** side-by-side

**Acceptance check:** This is your demo backbone — must be smooth.

## **PHASE 3 — Differentiators (ONLY If Time Allows)**

### **6️⃣ Multilingual Output**

* [ ] Integrate **translation API** (or mock)  
* [ ] Translate adapted module  
* [ ] Add **Language Toggle** in UI

**Note:** Optional but impressive.

### **7️⃣ WhatsApp / PDF Export**

* [ ] Generate clean **PDF** from adapted text  
* [ ] Mock **"Push to WhatsApp"** button  
* [ ] Show **confirmation message**

**Note:** Mocking is acceptable.

## **PHASE 4 — Bonus (ONLY If Everything Else Works)**

### **8️⃣ Feedback Loop Visualization (UNCHANGED Could-Have)**

**Owner:** Frontend

* [ ] **Define feedback schema:**  
  * Module ID  
  * Helpful / Not Helpful  
* [ ] **Mock feedback data**  
* [ ] Render **Chart.js** (Simple bar or pie chart)

**Important:** No teacher names. No ranking.

## **PHASE 5 — Safety, Polish & Demo Prep**

### **9️⃣ Guardrails & Ethics**

* [ ] Add **Human-in-the-loop** approval toggle  
* [ ] Block **unsafe keywords** (simple rule-based)  
* [ ] Add clear **disclaimer**: "AI-assisted draft"

### **🔟 Demo Scenario Preparation (CRITICAL)**

* [ ] Choose **1 chapter** (e.g., Photosynthesis)  
* [ ] Prepare **3 clusters**:  
  1. Tribal / Language barrier  
  2. No-lab rural school  
  3. Urban high-performing cluster  
* [ ] **Pre-generate outputs** (backup plan)

**Note:** This prevents live-demo failure.
