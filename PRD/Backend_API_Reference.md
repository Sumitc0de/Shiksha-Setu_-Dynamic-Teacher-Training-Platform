# Shiksha-Setu Backend API Reference

**Version:** 1.1  
**Base URL:** `http://localhost:8000/api`  
**Last Updated:** January 15, 2026

---

## Overview

This document provides complete API documentation for Shiksha-Setu backend. All endpoints return JSON unless specified otherwise.

### Base Configuration

- **Host:** `http://localhost:8000`
- **API Base Path:** `/api`
- **CORS:** Enabled for `localhost:3000` and `localhost:5173`
- **Authentication:** None (MVP)
- **Content-Type:** `application/json` (except file uploads)

---

## Table of Contents

1. [Translation API](#translation-api)
2. [Clusters API](#clusters-api)
3. [Manuals API](#manuals-api)
4. [Modules API](#modules-api)
5. [Error Handling](#error-handling)
6. [Common Responses](#common-responses)

---

## Translation API

### Base Path: `/api/translation`

#### 1. Get Supported Languages

```http
GET /api/translation/languages
```

**Response:**
```json
{
  "languages": [
    "english", "hindi", "marathi", "bengali", "telugu", 
    "tamil", "gujarati", "kannada", "malayalam", "punjabi", 
    "urdu", "odia"
  ],
  "language_codes": {
    "english": "en",
    "hindi": "hi",
    "marathi": "mr",
    "bengali": "bn",
    "telugu": "te",
    "tamil": "ta",
    "gujarati": "gu",
    "kannada": "kn",
    "malayalam": "ml",
    "punjabi": "pa",
    "urdu": "ur",
    "odia": "or"
  },
  "model": "Google Translate",
  "description": "Translation service for Indian languages"
}
```

#### 2. Translate Text

```http
POST /api/translation/translate
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Hello, how are you?",
  "target_language": "hindi",
  "source_language": "english"
}
```

**Response:**
```json
{
  "original_text": "Hello, how are you?",
  "translated_text": "नमस्ते, आप कैसे हैं?",
  "source_language": "english",
  "target_language": "hindi"
}
```

#### 3. Batch Translate

```http
POST /api/translation/translate/batch
Content-Type: application/json
```

**Request Body:**
```json
{
  "texts": [
    "Hello",
    "Good morning",
    "Thank you"
  ],
  "target_language": "marathi",
  "source_language": "english"
}
```

**Response:**
```json
{
  "translations": [
    "नमस्कार",
    "सुप्रभात",
    "धन्यवाद"
  ],
  "target_language": "marathi"
}
```

---

## Clusters API

### Base Path: `/api/clusters`

#### 1. Create Cluster

```http
POST /api/clusters
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tribal Belt Schools - Maharashtra",
  "geographic_type": "Tribal",
  "primary_language": "marathi",
  "infrastructure_level": "Low",
  "specific_challenges": "No science lab, limited internet, mixed-age classrooms",
  "total_teachers": 45,
  "additional_notes": "Monthly training preferred"
}
```

**Validation Rules:**
- `name`: Required, 1-100 chars, must be unique
- `geographic_type`: Required, must be "Urban", "Rural", or "Tribal"
- `primary_language`: Required, must be one of 12 supported languages
- `infrastructure_level`: Required, must be "High", "Medium", or "Low"
- `specific_challenges`: Optional, max 500 chars
- `total_teachers`: Required, integer between 1-10000
- `additional_notes`: Optional, max 500 chars

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Tribal Belt Schools - Maharashtra",
  "geographic_type": "Tribal",
  "primary_language": "marathi",
  "infrastructure_level": "Low",
  "specific_challenges": "No science lab, limited internet, mixed-age classrooms",
  "total_teachers": 45,
  "additional_notes": "Monthly training preferred",
  "created_at": "2026-01-15T10:00:00",
  "updated_at": "2026-01-15T10:00:00"
}
```

#### 2. List All Clusters

```http
GET /api/clusters?skip=0&limit=100
```

**Query Parameters:**
- `skip`: Offset for pagination (default: 0)
- `limit`: Max results (default: 100)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Tribal Belt Schools - Maharashtra",
    "geographic_type": "Tribal",
    "primary_language": "marathi",
    "infrastructure_level": "Low",
    "specific_challenges": "No science lab, limited internet",
    "total_teachers": 45,
    "additional_notes": "Monthly training preferred",
    "created_at": "2026-01-15T10:00:00",
    "updated_at": "2026-01-15T10:00:00"
  }
]
```

#### 3. Get Cluster by ID

```http
GET /api/clusters/{cluster_id}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Tribal Belt Schools - Maharashtra",
  "geographic_type": "Tribal",
  "primary_language": "marathi",
  "infrastructure_level": "Low",
  "specific_challenges": "No science lab, limited internet",
  "total_teachers": 45,
  "additional_notes": "Monthly training preferred",
  "created_at": "2026-01-15T10:00:00",
  "updated_at": "2026-01-15T10:00:00"
}
```

#### 4. Update Cluster

```http
PUT /api/clusters/{cluster_id}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Cluster Name",
  "total_teachers": 50
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Updated Cluster Name",
  "geographic_type": "Tribal",
  "primary_language": "marathi",
  "infrastructure_level": "Low",
  "specific_challenges": "No science lab, limited internet",
  "total_teachers": 50,
  "additional_notes": "Monthly training preferred",
  "created_at": "2026-01-15T10:00:00",
  "updated_at": "2026-01-15T10:30:00"
}
```

#### 5. Delete Cluster

```http
DELETE /api/clusters/{cluster_id}
```

**Response (204 No Content)**

---

## Manuals API

### Base Path: `/api/manuals`

#### 1. Upload Manual

```http
POST /api/manuals/upload
Content-Type: multipart/form-data
```

**Form Data:**
```
file: (PDF file, max 50MB)
title: "Science Teaching Manual - Class 8"
language: "english"
description: "Comprehensive guide for teaching science" (optional)
cluster_id: 1 (optional)
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('title', 'Science Teaching Manual');
formData.append('language', 'english');
formData.append('description', 'Comprehensive guide');
formData.append('cluster_id', '1');

fetch('http://localhost:8000/api/manuals/upload', {
  method: 'POST',
  body: formData
});
```

**Validation Rules:**
- `file`: Required, must be PDF
- `title`: Required, 1-200 chars
- `language`: Required, must be one of 12 supported languages
- `description`: Optional, text
- `cluster_id`: Optional, must reference valid cluster

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Science Teaching Manual - Class 8",
  "description": "Comprehensive guide for teaching science",
  "filename": "science_manual.pdf",
  "language": "english",
  "cluster_id": 1,
  "total_pages": 150,
  "upload_date": "2026-01-15T11:00:00",
  "indexed": false
}
```

#### 2. Index Manual for RAG

```http
POST /api/manuals/{manual_id}/index
```

**Description:** Processes PDF and indexes content for RAG search. Required before generating modules.

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Science Teaching Manual - Class 8",
  "description": "Comprehensive guide for teaching science",
  "filename": "science_manual.pdf",
  "language": "english",
  "cluster_id": 1,
  "total_pages": 150,
  "upload_date": "2026-01-15T11:00:00",
  "indexed": true
}
```

#### 3. List All Manuals

```http
GET /api/manuals?skip=0&limit=100
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Science Teaching Manual - Class 8",
    "description": "Comprehensive guide for teaching science",
    "filename": "science_manual.pdf",
    "language": "english",
    "cluster_id": 1,
    "total_pages": 150,
    "upload_date": "2026-01-15T11:00:00",
    "indexed": true
  }
]
```

#### 4. Get Manual by ID

```http
GET /api/manuals/{manual_id}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Science Teaching Manual - Class 8",
  "description": "Comprehensive guide for teaching science",
  "filename": "science_manual.pdf",
  "language": "english",
  "cluster_id": 1,
  "total_pages": 150,
  "upload_date": "2026-01-15T11:00:00",
  "indexed": true
}
```

#### 5. Delete Manual

```http
DELETE /api/manuals/{manual_id}
```

**Description:** Deletes manual, file, and all indexed content.

**Response (204 No Content)**

---

## Modules API

### Base Path: `/api/modules`

#### 1. Generate Module

```http
POST /api/modules/generate
Content-Type: application/json
```

**Request Body:**
```json
{
  "manual_id": 1,
  "cluster_id": 1,
  "original_content": "To teach photosynthesis, use a microscope to observe leaf cells under bright light. Students should work in pairs and document their observations in lab notebooks.",
  "target_language": "marathi",
  "section_title": "Chapter 3: Teaching Science Without Lab"
}
```

**Validation Rules:**
- `manual_id`: Required, must be indexed
- `cluster_id`: Required, must exist
- `original_content`: Required, 50-5000 chars
- `target_language`: Optional, defaults to cluster's primary_language
- `section_title`: Optional, max 200 chars

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Chapter 3: Teaching Science Without Lab",
  "manual_id": 1,
  "cluster_id": 1,
  "original_content": "To teach photosynthesis, use a microscope...",
  "adapted_content": "To teach photosynthesis without a microscope, collect local leaves and use sunlight observation methods. Ask students to work in groups and draw what they see. Use simple materials available locally...",
  "target_language": "marathi",
  "section_title": "Chapter 3: Teaching Science Without Lab",
  "metadata": "{\"cluster_name\": \"Tribal Belt Schools\", \"manual_title\": \"Science Teaching Manual\", \"generated_at\": \"2026-01-15T12:00:00\"}",
  "created_at": "2026-01-15T12:00:00",
  "updated_at": "2026-01-15T12:00:00"
}
```

#### 2. List All Modules

```http
GET /api/modules?cluster_id=1&manual_id=1&skip=0&limit=100
```

**Query Parameters:**
- `cluster_id`: Filter by cluster (optional)
- `manual_id`: Filter by manual (optional)
- `skip`: Pagination offset (default: 0)
- `limit`: Max results (default: 100)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Chapter 3: Teaching Science Without Lab",
    "manual_id": 1,
    "cluster_id": 1,
    "original_content": "To teach photosynthesis...",
    "adapted_content": "To teach photosynthesis without a microscope...",
    "target_language": "marathi",
    "section_title": "Chapter 3: Teaching Science Without Lab",
    "metadata": "{\"cluster_name\": \"Tribal Belt Schools\"}",
    "created_at": "2026-01-15T12:00:00",
    "updated_at": "2026-01-15T12:00:00"
  }
]
```

#### 3. Get Module by ID

```http
GET /api/modules/{module_id}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Chapter 3: Teaching Science Without Lab",
  "manual_id": 1,
  "cluster_id": 1,
  "original_content": "To teach photosynthesis, use a microscope...",
  "adapted_content": "To teach photosynthesis without a microscope...",
  "target_language": "marathi",
  "section_title": "Chapter 3: Teaching Science Without Lab",
  "metadata": "{\"cluster_name\": \"Tribal Belt Schools\", \"manual_title\": \"Science Teaching Manual\"}",
  "created_at": "2026-01-15T12:00:00",
  "updated_at": "2026-01-15T12:00:00"
}
```

#### 4. Delete Module

```http
DELETE /api/modules/{module_id}
```

**Response (204 No Content)**

#### 5. Submit Feedback

```http
POST /api/modules/{module_id}/feedback
Content-Type: application/json
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Very helpful adaptation for our rural context"
}
```

**Validation Rules:**
- `rating`: Required, integer 1-5
- `comment`: Optional, text

**Response (200 OK):**
```json
{
  "id": 1,
  "module_id": 1,
  "rating": 5,
  "comment": "Very helpful adaptation for our rural context",
  "submitted_at": "2026-01-15T13:00:00"
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PUT/POST operations |
| 201 | Created | Successful resource creation |
| 204 | No Content | Successful DELETE operations |
| 400 | Bad Request | Invalid input, validation errors |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side errors |

### Example Errors

**400 Bad Request:**
```json
{
  "detail": "Only PDF files are allowed"
}
```

**404 Not Found:**
```json
{
  "detail": "Cluster with ID 999 not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Error generating module: Connection timeout"
}
```

---

## Common Responses

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

### API Root

```http
GET /
```

**Response:**
```json
{
  "message": "Shiksha-Setu API",
  "status": "running",
  "version": "1.0.0",
  "endpoints": {
    "clusters": "/api/clusters",
    "manuals": "/api/manuals",
    "translation": "/api/translation",
    "modules": "/api/modules",
    "docs": "/docs"
  }
}
```

---

## Interactive Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Migration Notes

### Database Schema Changes (v1.1)

If upgrading from v1.0, run the migration script:

```bash
cd backend
python migrate_database.py
```

**Changed Fields:**
- Clusters: `region_type` → `geographic_type`
- Clusters: `language` → `primary_language`
- Clusters: Added `total_teachers`, `infrastructure_level`
- Manuals: Added `description`, `language`, `cluster_id`
- Modules: `language` → `target_language`
- Modules: Added `section_title`, `metadata`, `updated_at`
- Feedback: `is_helpful` → `rating` (1-5 scale)

---

## Testing with cURL

### Create Cluster
```bash
curl -X POST http://localhost:8000/api/clusters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cluster",
    "geographic_type": "Urban",
    "primary_language": "english",
    "infrastructure_level": "High",
    "total_teachers": 100
  }'
```

### Upload Manual
```bash
curl -X POST http://localhost:8000/api/manuals/upload \
  -F "file=@manual.pdf" \
  -F "title=Test Manual" \
  -F "language=english"
```

### Translate Text
```bash
curl -X POST http://localhost:8000/api/translation/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello",
    "target_language": "hindi",
    "source_language": "english"
  }'
```

--- 
**Document Version:** 1.1  
**Last Updated:** January 15, 2026  
**Maintained By:** Shiksha-Setu Development Team
