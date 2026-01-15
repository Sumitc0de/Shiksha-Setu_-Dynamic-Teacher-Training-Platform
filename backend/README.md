# Shiksha-Setu Backend

FastAPI-based backend for the Dynamic Teacher Training Platform.

## 🚨 Important Update (January 15, 2026)

**API Schema has been updated to v1.1.** See [API_SCHEMA_UPDATE.md](./API_SCHEMA_UPDATE.md) for details.

If you have an existing database:
```bash
python migrate_database.py  # Run migration script
```

For new setup, continue with instructions below.

---

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
copy .env.example .env
```

5. Add your API keys to the `.env` file

6. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Project Structure

```
backend/
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
│
├── core/                       # Core Configuration
│   ├── __init__.py
│   ├── config.py              # Application settings (Pydantic)
│   └── database.py            # SQLAlchemy database setup
│
├── models/                     # Database Models (SQLAlchemy)
│   ├── __init__.py
│   └── database_models.py     # Cluster, Manual, Module, Feedback models
│
├── schemas/                    # API Schemas (Pydantic)
│   ├── __init__.py
│   └── api_schemas.py         # Request/Response validation schemas
│
├── services/                   # Business Logic Layer
│   ├── __init__.py
│   ├── pdf_processor.py       # PDF extraction and chunking
│   ├── rag_engine.py          # ChromaDB RAG pipeline
│   └── ai_engine.py           # Groq AI adaptation engine
│
├── api/                        # API Routes (FastAPI)
│   ├── __init__.py
│   ├── clusters.py            # Cluster CRUD endpoints
│   ├── manuals.py             # Manual upload and indexing
│   └── modules.py             # Module generation and management
│
├── uploads/                    # PDF file storage (auto-created)
├── chroma_db/                  # ChromaDB vector storage (auto-created)
└── shiksha_setu.db            # SQLite database (auto-created)
```

## Architecture Layers

### 1. Core Layer (`core/`)
- **config.py**: Application configuration using Pydantic Settings
- **database.py**: SQLAlchemy engine, session management, and database initialization

### 2. Models Layer (`models/`)
- SQLAlchemy ORM models representing database tables
- Defines relationships between entities

### 3. Schemas Layer (`schemas/`)
- Pydantic models for API request/response validation
- Ensures type safety and data validation

### 4. Services Layer (`services/`)
- Business logic and external service integrations
- **PDFProcessor**: PDF text extraction and chunking
- **RAGEngine**: Semantic search using ChromaDB
- **AIAdaptationEngine**: Content adaptation using Groq LLM

### 5. API Layer (`api/`)
- FastAPI route handlers
- Orchestrates services and database operations
- Returns validated responses

## Phase 1 Implementation - Complete

### Features Implemented
- **Database Models**: Cluster, Manual, Module, Feedback tables with SQLAlchemy
- **PDF Processing**: Extract text, chunk content, page count detection
- **RAG Pipeline**: ChromaDB integration with semantic search
- **AI Adaptation**: Groq LLM integration for pedagogical adaptation
- **API Endpoints**:
  - Cluster CRUD operations
  - Manual upload and indexing
  - Module generation with cluster-specific adaptation
  - Feedback collection

### API Endpoints

#### Clusters
- `POST /api/clusters` - Create a cluster profile
- `GET /api/clusters` - List all clusters
- `GET /api/clusters/{id}` - Get specific cluster
- `PUT /api/clusters/{id}` - Update cluster
- `DELETE /api/clusters/{id}` - Delete cluster

#### Manuals
- `POST /api/manuals/upload` - Upload PDF manual
- `POST /api/manuals/{id}/index` - Index manual for RAG
- `GET /api/manuals` - List all manuals
- `GET /api/manuals/{id}` - Get specific manual
- `DELETE /api/manuals/{id}` - Delete manual

#### Modules
- `POST /api/modules/generate` - Generate adapted module
- `GET /api/modules` - List modules (with filters)
- `GET /api/modules/{id}` - Get specific module
- `PATCH /api/modules/{id}/approve` - Approve module
- `DELETE /api/modules/{id}` - Delete module
- `POST /api/modules/{id}/feedback` - Submit feedback

## Testing the API

1. Start the server
2. Visit `http://localhost:8000/docs` for interactive API documentation
3. Test the workflow:
   - Create a cluster profile
   - Upload and index a PDF manual
   - Generate an adapted module for the cluster

## Next Steps (Phase 2 - Frontend)

- Build admin dashboard UI
- Implement side-by-side comparison view
- Add module approval workflow
- Create export functionality (PDF/WhatsApp)
├── routers/            # API route handlers
├── services/           # Business logic
└── utils/              # Utility functions
```
