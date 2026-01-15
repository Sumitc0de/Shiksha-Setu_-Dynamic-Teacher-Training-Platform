# Backend API Schema Update - January 15, 2026

## What Changed

The backend API schema has been updated to match the Frontend Phase 2 Requirements PRD. This ensures consistency between backend implementation and frontend expectations.

## Key Changes

### 1. Cluster Model
- **Old:** `region_type`, `language`, `infrastructure_constraints`, `key_issues`, `grade_range`
- **New:** `geographic_type`, `primary_language`, `infrastructure_level`, `specific_challenges`, `total_teachers`, `additional_notes`

### 2. Manual Model
- **Added Fields:** `description`, `language`, `cluster_id`
- Now manuals can be associated with specific clusters and have language metadata

### 3. Module Model
- **Changed:** `language` → `target_language`
- **Added Fields:** `section_title`, `metadata`, `updated_at`
- **Removed:** `approved` field

### 4. Feedback Model
- **Changed:** `is_helpful` (boolean) → `rating` (1-5 integer scale)

### 5. Module Generation API
- **Old Request:**
  ```json
  {
    "manual_id": 1,
    "cluster_id": 1,
    "topic": "Photosynthesis"
  }
  ```
- **New Request:**
  ```json
  {
    "manual_id": 1,
    "cluster_id": 1,
    "original_content": "Text to adapt...",
    "target_language": "hindi",
    "section_title": "Chapter 3"
  }
  ```

## Migration Required

If you have an existing database, you **MUST** run the migration script:

```bash
cd backend
python migrate_database.py
```

**⚠️ BACKUP YOUR DATABASE BEFORE MIGRATING!**

The migration script will:
- Rename columns
- Add new columns with default values
- Transform existing data to fit new schema
- Preserve all existing records

## For Frontend Developers

### Updated Documentation
1. **Frontend PRD:** `/PRD/Frontend_Phase2_Requirements.md` (v1.1)
2. **API Reference:** `/PRD/Backend_API_Reference.md` (complete API docs)

### Key Points
- All API endpoints remain the same
- Request/response schemas have changed
- Field names are now consistent across all endpoints
- More descriptive field names (e.g., `geographic_type` instead of `region_type`)

### Example API Calls

#### Create Cluster (New Schema)
```javascript
const response = await fetch('http://localhost:8000/api/clusters', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Tribal Schools Maharashtra",
    geographic_type: "Tribal",
    primary_language: "marathi",
    infrastructure_level: "Low",
    specific_challenges: "No internet, limited electricity",
    total_teachers: 45,
    additional_notes: "Monthly training preferred"
  })
});
```

#### Upload Manual (New Schema)
```javascript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('title', 'Science Manual');
formData.append('language', 'english');
formData.append('description', 'Grade 8 science teaching guide');
formData.append('cluster_id', '1');

const response = await fetch('http://localhost:8000/api/manuals/upload', {
  method: 'POST',
  body: formData
});
```

#### Generate Module (New Schema)
```javascript
const response = await fetch('http://localhost:8000/api/modules/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    manual_id: 1,
    cluster_id: 1,
    original_content: "Text from manual to adapt...",
    target_language: "hindi",
    section_title: "Teaching Without Lab Equipment"
  })
});
```

## Testing

### 1. Start Fresh (Recommended for Development)
```bash
cd backend
rm shiksha_setu.db  # Delete old database
python init_database.py  # Create new database with updated schema
python main.py  # Start server
```

### 2. Migrate Existing Database
```bash
cd backend
python migrate_database.py  # Follow prompts
python main.py  # Start server
```

### 3. Verify Changes
```bash
# Check API documentation
curl http://localhost:8000/docs

# Test health endpoint
curl http://localhost:8000/health

# Test cluster creation
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

## Breaking Changes

### What Will Break
- Any existing frontend code using old field names
- Direct database queries using old column names
- Hardcoded validation for old fields

### What Won't Break
- API endpoints (all routes remain the same)
- Authentication flow (none for MVP)
- File upload mechanism
- Translation API

## Rollback

If you need to rollback:
1. Restore database from backup
2. Checkout previous commit: `git checkout <previous-commit>`
3. Restart server

## Support

- **API Documentation:** http://localhost:8000/docs
- **PRD Documentation:** `/PRD/Backend_API_Reference.md`
- **Frontend Requirements:** `/PRD/Frontend_Phase2_Requirements.md`

---

**Updated:** January 15, 2026  
**Version:** Backend API v1.1
