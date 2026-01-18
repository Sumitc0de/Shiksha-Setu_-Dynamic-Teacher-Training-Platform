# **Shiksha-Setu: Dynamic Teacher Training Platform**

## **Product Requirements Document (PRD)**

**Version:** 1.7 (In Development)

**Status:** Phase 1 Complete - OCR Support Added

**Last Updated:** January 18, 2026

**Project Type:** B2G (Business to Government) / EdTech AI Dashboard

**Document Type:** LIVING DOCUMENT - Updated continuously as project evolves

## **1. Purpose & Problem Statement**

### **The "Why"**

Current government teacher training is a "one-size-fits-all" failure. State bodies (SCERT) produce rigid, 50-page PDF manuals once a year. These manuals fail to address hyper-local realities—such as tribal language barriers, lack of science laboratories, or specific student behavioral issues.

### **The Problem**

Administrators (like Dr. Kumar, DIET Principal) cannot manually rewrite these 50-page manuals for 2,000 different teachers. The result is "Training Fatigue"—teachers attend mandatory workshops that are irrelevant to their actual needs, leading to poor implementation and wasted resources.

### **The Solution: Shiksha-Setu**

A **Dynamic Pedagogical Engine** that uses GenAI (RAG) to ingest standard state manuals and "refactor" them into personalized, bite-sized micro-learning modules based on specific "Cluster Profiles" (e.g., "Tribal Belt," "Low Infrastructure").

## **2. Target Audience & User Personas**

### **Primary User: The Administrator**

* **Roles:** DIET Principal (Dr. Kumar), Academic Coordinators, Master Trainers.  
* **Motivation:** Wants to improve training relevance without increasing manual workload.  
* **Tech Literacy:** Moderate. Needs a clean, "Command Center" dashboard, not code.  
* **Key Action:** Uploads manuals, defines cluster needs, approves generated content.

### **Secondary User: The Teacher**

* **Role:** Govt. School Teacher (Grades 1–8).  
* **Context:** Overworked, limited internet, uses WhatsApp extensively.  
* **Motivation:** Wants practical, quick solutions for *today's* classroom problems, not theory.  
* **Key Action:** Receives bite-sized content on WhatsApp, applies it, gives simple Feedback.

## **3. Features & Functionality (MoSCoW)**

### **Must-Have (The Hackathon MVP)**

1. **State Manual Ingestion (RAG):**  
   * *User Story:* As an Admin, I want to upload a PDF (State Training Manual) so the system can "read" and index it.  
   * *Tech:* PyPDF/LlamaParse → Chunking → ChromaDB (Vector Store).  
2. **Cluster Profile Builder:**  
   * *User Story:* As an Admin, I want to define a "Cluster" with specific constraints (e.g., Language: Gondi, Infra: No Lab, Issue: Absenteeism).  
   * *Tech:* SQLite Database.  
3. **Pedagogical Adaptation Engine:**  
   * *User Story:* As an Admin, I want the AI to rewrite a specific lesson (e.g., "Photosynthesis") specifically for a school with no lab equipment.  
   * *Tech:* Groq (Llama 3) + Prompt Engineering (Chain-of-Thought).  
4. **Comparison Dashboard:**  
   * *User Story:* As an Admin, I want to see the "Original Text" vs. "Localized Module" side-by-side to verify accuracy.

### **Should-Have (Differentiation)**

5. **Multilingual Vernacular Support:**  
   * *User Story:* The output should be automatically translated into Hindi/Marathi or specific dialects.  
   * *Tech:* Google Translate API or Meta NLLB.  
6. **WhatsApp/PDF Export:**  
   * *User Story:* As an Admin, I want to one-click share the generated module to a specific Cluster's phone group.

7. **On-the-spot Video Suggestions (No Storage):**
   * *Simple Idea:* The platform can suggest short, publicly available videos from the web (for example, YouTube clips) that match the generated module. These suggestions appear inside the web app for previewing or sharing, but we do NOT download or store video files or copies in our database.
   * *Why this helps:* Videos give teachers quick, practical examples and demonstrations they can watch or forward. By only linking/embedding public videos and showing clear credit (title + source), we avoid copyright problems and keep the system lightweight.
   * *User Story:* As an Admin, I want automatic suggestions of useful, public videos related to a module so I can quickly preview or share them with teachers without the platform keeping copies.
   * *Implementation notes:* Use public search/embed APIs (YouTube or other providers) to find and display video links or embeds; always show the original source and attribution. Do not persist video files; optionally log the shared link for audit/session purposes only.


### **Could-Have (Bonus)**

7. **Feedback Loop Visualization:**  
   * **Scope Clarification:** This feature remains in "Could-Have" and is optional for the hackathon MVP.  
   * *User Story:* A simple chart showing aggregated teacher feedback (Helpful / Not Helpful) to support rapid iteration.  
   * *Tech:* Chart.js.

### **Won't-Have (Out of Scope)**

* Native Mobile App (Web App only).  
* Video Content Generation.  
* Complex LMS with individual teacher logins.

## **4. Non-Functional Requirements**

* **Performance:** Module generation must complete in **<30 seconds** (Leveraging Groq's LPU); Dashboard load time **<2 seconds**.  
* **Reliability:** Hallucination and policy-alignment guardrails (must not invent dangerous experiments).  
* **Scalability:** Must handle 50+ page PDFs without token limit errors.  
* **Accessibility:** Generated content must be readable on low-end smartphones (simple text/images, no heavy data).  
* **Control:** Explicit "Human-in-the-loop" approval button required before sharing content.

## **5. Success Metrics (KPIs)**

### **Technical & Efficiency Metrics**

* **Cycle Time Reduction:** Time to create a custom module (Target: < 1 minute vs. Manual: 4 hours).  
* **Relevance Score (Simulated):** % of generated modules that successfully incorporate the "Cluster Constraint".  
* **Token Efficiency:** Cost per module generation.

### **Outcome Metrics**

* **Teacher Satisfaction:** Percentage of need-based modules in catalog and teacher satisfaction with training relevance.  
* **Classroom Fidelity:** Implementation fidelity of the training concepts.

## **6. Ethics & Governance**

* **No Punitive Analytics:** No teacher ranking or punitive analytics will be used.  
* **Data Usage:** Data is strictly for academic support.  
* **Autonomy:** Respect for teacher dignity and autonomy is paramount.

## **7. Design & UX: The "Command Center"**

* **Sidebar:** Navigation (Uploads, Clusters, Generated Modules, Analytics).  
* **Main View (Split Screen):**  
  * *Left Panel:* "Source of Truth" (The PDF Viewer highlighting the original section).  
  * *Right Panel:* "The Adapter" (Editable Text Editor showing the AI-rewritten, localized version).  
* **Action Bar:** Dropdown for Cluster Profile, Button for "Generate Adaptation," and Button for "Push to WhatsApp".

## **8. Assumptions, Risks, & Dependencies**

* **Assumptions:** State Manuals are digital (PDF/Doc); Teachers have access to at least one smartphone per school.  
* **Risks:**  
  * *AI Hallucinations:* Mitigated by Human-in-the-loop approval.  
  * *Language Nuance:* Translation APIs might miss dialect-specific terms.  
* **Dependencies:** Groq API, WhatsApp Business API (Sandbox), Google/Meta Translation API.

## **9. Release Criteria (MVP)**

1. Successful ingestion of a 10-page sample PDF.  
2. Creation of 2 distinct Cluster Profiles (e.g., "Urban High-Tech" vs. "Rural Low-Tech").  
3. Generation of distinct outputs for the *same* input chapter, demonstrating clear customization.  
4. Stable demo with zero application crashes duri

---

## **10. Technology Stack (Implementation)**

### Backend (Professional Layered Architecture)
- **Framework:** FastAPI (Python 3.10+)
- **Structure:** Modular layered architecture
  - `core/` - Configuration and database setup
  - `models/` - SQLAlchemy ORM models
  - `schemas/` - Pydantic validation schemas
  - `services/` - Business logic layer
  - `api/` - Route handlers
- **PDF Processing:** PyPDF2, PDFPlumber
- **Vector Database:** ChromaDB with Sentence Transformers
- **LLM Integration:** Groq API (Llama 3.3-70B)
- **Database:** SQLite with SQLAlchemy ORM
- **Translation:** Deep-Translator
- **Server:** Uvicorn

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** CSS3 (Modular)

### Development Tools
- **Version Control:** Git
- **API Documentation:** FastAPI Auto-docs (Swagger)
- **Environmen5 - January 13, 2026
**Backend Structure Reorganization - Professional Architecture**
- Reorganized backend into professional layered architecture
- Created modular folder structure:
  - `core/` for configuration and database
  - `models/` for database models
  - `schemas/` for API validation
  - `services/` for business logic
  - `api/` for route handlers
- Improved code organization following FastAPI best practices
- Enhanced maintainability and scalability
- Created comprehensive architecture documentation
- Added .gitignore for proper version control
- Cleaned up old flat structure files
- All imports updated to use new structure
- Structure verified and tested successfully
- Ready for team collaboration and Phase 2 implementation

### Version 1.t Management:** python-dotenv

---

## **11. Changelog**

### Version 1.7 - January 18, 2026
**OCR Support for Scanned PDFs and Images**
- Added OCR (Optical Character Recognition) capability to handle image-based PDFs
- Can now process:
  - Scanned training manuals
  - PDFs with photos containing text
  - Image-based documents
  - Mixed PDFs (some pages text, some scanned)
- Implementation details:
  - Added pytesseract, pdf2image, and Pillow dependencies
  - Smart fallback mechanism: tries text extraction first, uses OCR if insufficient
  - Three extraction modes: automatic (default), OCR-only, hybrid
  - Automatic detection of scanned PDFs
  - Supports English + Hindi by default, extensible to 12+ Indian languages
- Performance considerations:
  - Text extraction: ~1 sec per 50 pages
  - OCR: ~2-5 sec per page (300 DPI)
  - Configurable DPI and language settings
- External dependencies:
  - Tesseract OCR engine (requires separate installation on Windows)
  - Poppler (for PDF to image conversion)
- Created comprehensive OCR_SETUP.md guide for installation and configuration
- Maintains backward compatibility - existing text-based PDFs process normally
- Benefits: No manual rejected due to being scanned, broader document support

### Version 1.6 - January 17, 2026
**Pin Feature Implementation**
- Added pin/unpin functionality for clusters and manuals to help teachers prioritize frequently used items
- Database changes:
  - Added `pinned` boolean column to clusters table (default: false)
  - Added `pinned` boolean column to manuals table (default: false)
- Backend API enhancements:
  - Added PATCH `/api/clusters/{id}/pin` endpoint to toggle cluster pin status
  - Added PATCH `/api/manuals/{id}/pin` endpoint to toggle manual pin status
  - Updated list endpoints to sort pinned items first (pinned items appear at top)
- Frontend UI updates:
  - Added pin/unpin buttons to cluster cards in ClustersPage
  - Added pin/unpin buttons to manual items in ManualsPage
  - Pinned items display pin icon for visual identification
  - Pinned items automatically sorted to top of list for quick access
- Created database migration script (`add_pinned_column.py`) for existing databases
- Feature benefits: Teachers with multiple clusters/manuals can prioritize their most-used items for faster access

### Version 1.4 - January 13, 2026
**Phase 1 - Backend Core MVP Complete**
- Implemented database models (Cluster, Manual, Module, Feedback)
- Created PDF processing pipeline with text extraction and intelligent chunking
- Built RAG engine with ChromaDB for semantic search and context retrieval
- Integrated Groq AI (Llama 3.3) for pedagogical content adaptation
- Developed complete API with 15+ endpoints:
  - Cluster CRUD operations (create, read, update, delete)
  - Manual upload, indexing, and management
  - Module generation with AI adaptation
  - Feedback collection system
- Added safety validation and competency tagging capabilities
- Created comprehensive API documentation with FastAPI auto-docs
- All Phase 1 acceptance criteria met and tested
- Ready for Phase 2 (Frontend Dashboard) implementation

### Version 1.3 - January 12, 2026 - 15:45 IST
- Phase 0 implementation completed
- Backend successfully running at http://localhost:8000
- Created backend structure with FastAPI
- Set up frontend with React + Vite
- Implemented environment configuration system
- Created .gitignore and README files for both frontend and backend
- Added health check endpoints
- Technology stack finalized and documented
- Resolved Python 3.13 compatibility issues
- Added prerequisites documentation (Node.js, Python 3.10+)
- Created Windows setup guide for execution policy issues

### Version 1.2 - January 12, 2026
- Initial PRD creation and repository setup
- Established core MVP features (PDF ingestion, cluster profiles, AI adaptation, comparison dashboard)
- Defined MoSCoW priorities
- Set up project structure and documentation standards
- Established as living document with changelog tracking
- Created Copilot usage guidelinesng the workflow.

**Status:** PRD frozen. Ready for implementation.
