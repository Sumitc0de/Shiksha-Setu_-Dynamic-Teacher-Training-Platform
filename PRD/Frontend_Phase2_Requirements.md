# Shiksha-Setu Frontend - Phase 2 Requirements

**Project:** Shiksha-Setu Dynamic Teacher Training Platform  
**Document Type:** Frontend Development Requirements (PRD)  
**Phase:** Phase 2 - Frontend Development  
**Status:** Ready for Development  
**Date:** January 13, 2026  
**Last Updated:** January 15, 2026

---

## 1. Executive Summary

This document outlines the frontend requirements for Shiksha-Setu, a Dynamic Teacher Training Platform. The backend API (Phase 1) is complete and operational at `http://localhost:8000`. This PRD provides complete specifications for the React-based admin dashboard that will consume these APIs.

### Project Context
- **Target Users:** Government education administrators (DIET Principals, Academic Coordinators)
- **Purpose:** Enable administrators to upload training manuals, define teacher clusters, and generate AI-adapted training modules
- **Tech Stack:** React 18 + Vite + Tailwind CSS + React Router
- **Timeline:** 7-10 days for MVP

---

## 2. Backend API Summary

### Base URL
```
http://localhost:8000/api
```

### Authentication
- No authentication required for MVP
- CORS enabled for `localhost:3000` and `localhost:5173`

### Available Endpoints

#### Translation API (`/translation`)
| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/translate` | Translate text to Indian languages | `{text, target_language, source_language}` |
| POST | `/translate/batch` | Batch translate multiple texts | `{texts[], target_language, source_language}` |
| GET | `/languages` | Get supported languages | - |

**Supported Languages:** English, Hindi, Marathi, Bengali, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia (12 total)

#### Clusters API (`/clusters`)
| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/` | Create new cluster | ClusterCreate schema |
| GET | `/` | List all clusters | - |
| GET | `/{id}` | Get cluster by ID | - |
| PUT | `/{id}` | Update cluster | ClusterUpdate schema |
| DELETE | `/{id}` | Delete cluster | - |

**Cluster Schema:**
```javascript
{
  name: string,                    // Required, max 100 chars
  geographic_type: string,         // Required: "Urban" / "Rural" / "Tribal"
  primary_language: string,        // Required: Any of 12 supported languages
  infrastructure_level: string,    // Required: "High" / "Medium" / "Low"
  specific_challenges: string,     // Optional: max 500 chars, textarea
  total_teachers: integer,         // Required: 1-10000
  additional_notes: string         // Optional: max 500 chars, textarea
}
```

#### Manuals API (`/manuals`)
| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/upload` | Upload PDF manual | FormData (multipart) |
| POST | `/{id}/index` | Index manual for RAG search | - |
| GET | `/` | List all manuals | - |
| GET | `/{id}` | Get manual details | - |
| DELETE | `/{id}` | Delete manual | - |

**Manual Upload Schema:**
```javascript
FormData {
  file: File,              // PDF file (required)
  title: string,           // Manual title (required)
  language: string,        // Content language (required, from supported languages)
  description: string,     // Description (optional)
  cluster_id: integer,     // Associated cluster ID (optional)
}
```

**Manual Response Schema:**
```javascript
{
  id: integer,
  title: string,
  description: string,
  filename: string,
  language: string,
  cluster_id: integer,
  total_pages: integer,
  upload_date: datetime,
  indexed: boolean
}
```

#### Modules API (`/modules`)
| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/generate` | Generate AI-adapted module | ModuleGenerate schema |
| GET | `/` | List all modules | Query: `?cluster_id=X&manual_id=Y` |
| GET | `/{id}` | Get module details | - |
| DELETE | `/{id}` | Delete module | - |
| POST | `/{id}/feedback` | Submit teacher feedback | `{rating: 1-5, comment: string}` |

**Module Generation Schema:**
```javascript
{
  manual_id: integer,           // Source manual ID (required)
  cluster_id: integer,          // Target cluster ID (required)
  original_content: string,     // Text to adapt (required, 50-5000 chars)
  target_language: string,      // Translation target (optional, defaults to cluster's primary_language)
  section_title: string         // Section name (optional, max 200 chars)
}
```

**Module Response:**
```javascript
{
  id: integer,
  title: string,
  original_content: string,
  adapted_content: string,      // AI-generated adaptation
  manual_id: integer,
  cluster_id: integer,
  target_language: string,
  section_title: string,
  metadata: string,             // JSON string with additional info
  created_at: datetime,
  updated_at: datetime
}
```

**Feedback Schema:**
```javascript
{
  rating: integer,              // Required: 1-5 scale
  comment: string               // Optional: feedback text
}
```

---

## 3. Frontend Architecture

### Technology Stack

#### Core Dependencies (Already Installed)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.1",
  "axios": "^1.6.5",
  "vite": "^5.0.11"
}
```

#### Required Additional Dependencies
```bash
# UI Framework
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Icons & UI Components
npm install react-icons
npm install @headlessui/react

# Forms
npm install react-hook-form

# Notifications
npm install react-hot-toast

# State Management (Optional but Recommended)
npm install @tanstack/react-query

# File Upload
npm install react-dropzone
```

### Project Structure
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Clusters/
│   │   │   ├── ClusterList.jsx
│   │   │   ├── ClusterForm.jsx
│   │   │   └── ClusterDetail.jsx
│   │   ├── Manuals/
│   │   │   ├── ManualList.jsx
│   │   │   ├── ManualUpload.jsx
│   │   │   └── ManualDetail.jsx
│   │   ├── Modules/
│   │   │   ├── ModuleGenerator.jsx
│   │   │   ├── ModuleList.jsx
│   │   │   └── ModuleDetail.jsx
│   │   └── NotFound.jsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── clusters/
│   │   │   ├── ClusterCard.jsx
│   │   │   └── ClusterFormFields.jsx
│   │   ├── manuals/
│   │   │   ├── ManualCard.jsx
│   │   │   └── FileUploadZone.jsx
│   │   ├── modules/
│   │   │   ├── ModuleCard.jsx
│   │   │   ├── ContentEditor.jsx
│   │   │   └── ComparisonView.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       ├── TextArea.jsx
│   │       ├── Modal.jsx
│   │       ├── LoadingSpinner.jsx
│   │       └── EmptyState.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── clusterService.js
│   │   ├── manualService.js
│   │   ├── moduleService.js
│   │   └── translationService.js
│   │
│   ├── hooks/
│   │   ├── useClusters.js
│   │   ├── useManuals.js
│   │   └── useModules.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validation.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 4. Page Specifications

### 4.1 Dashboard (Home Page)

**Route:** `/`

**Purpose:** Overview of system status and quick actions

**Layout:**
```
+------------------+
| Header           |
+-----+------------+
| Nav | Dashboard  |
|     | Stats      |
|     | Cards      |
|     |            |
|     | Quick      |
|     | Actions    |
+-----+------------+
```

**Required Elements:**
1. **Statistics Cards** (4 cards in grid)
   - Total Clusters (count from API)
   - Total Manuals (count from API)
   - Generated Modules (count from API)
   - Active Languages (count from supported languages)

2. **Recent Activity** (List)
   - Last 5 modules generated
   - Last 3 manuals uploaded
   - Show: Title, Date, Cluster/Manual name

3. **Quick Actions** (Button group)
   - "Upload New Manual" → `/manuals/upload`
   - "Create Cluster" → `/clusters/new`
   - "Generate Module" → `/modules/generate`

**API Calls:**
- `GET /api/clusters` → Count
- `GET /api/manuals` → Count
- `GET /api/modules` → Count and recent items

---

### 4.2 Cluster Management

#### 4.2.1 Cluster List Page

**Route:** `/clusters`

**Purpose:** View and manage all teacher clusters

**Layout:**
```
+------------------+
| Header           |
+-----+------------+
| Nav | Clusters   |
|     | [+ New]    |
|     | [Search]   |
|     |            |
|     | Cards Grid |
|     | [Edit][Del]|
+-----+------------+
```

**Required Elements:**
1. **Action Bar**
   - "Create New Cluster" button (primary)
   - Search input (filter by name)
   - Filter dropdown (by geographic_type)

2. **Cluster Cards Grid** (3 columns)
   - Display per card:
     - Cluster name (h3)
     - Geographic type badge
     - Primary language
     - Total teachers count
     - Infrastructure level icon
     - Edit button
     - Delete button (with confirmation)

3. **Empty State**
   - Show when no clusters exist
   - Message: "No clusters yet. Create your first cluster to get started."
   - CTA button: "Create Cluster"

**API Calls:**
- `GET /api/clusters` → Display all
- `DELETE /api/clusters/{id}` → On delete confirmation

**State Management:**
- Clusters list (from API)
- Search filter (local state)
- Loading state
- Error state

---

#### 4.2.2 Cluster Form (Create/Edit)

**Route:** `/clusters/new` or `/clusters/{id}/edit`

**Purpose:** Create or update cluster profiles

**Layout:**
```
+------------------+
| Header           |
+-----+------------+
| Nav | Cluster    |
|     | Form       |
|     |            |
|     | [Cancel]   |
|     | [Save]     |
+-----+------------+
```

**Required Form Fields:**

1. **Cluster Name** (Text Input)
   - Required
   - Max 100 characters
   - Placeholder: "e.g., Tribal Belt Schools - Maharashtra"

2. **Geographic Type** (Radio Group)
   - Options: "Urban" | "Rural" | "Tribal"
   - Required
   - Display as cards with icons

3. **Primary Language** (Dropdown)
   - Options: All 12 supported languages from `/api/translation/languages`
   - Required
   - Searchable dropdown

4. **Infrastructure Level** (Radio Group)
   - Options: "High" | "Medium" | "Low"
   - Required
   - Display as cards with descriptions

5. **Total Teachers** (Number Input)
   - Required
   - Min: 1
   - Max: 10000
   - Placeholder: "50"

6. **Specific Challenges** (Textarea)
   - Optional
   - Max 500 characters
   - Placeholder: "e.g., No science lab, limited internet, mixed-age classrooms"
   - Character counter

7. **Additional Notes** (Textarea)
   - Optional
   - Max 500 characters
   - Placeholder: "Any other relevant information"

**Form Actions:**
- **Cancel** → Go back to `/clusters`
- **Save** → 
  - If create: `POST /api/clusters`
  - If edit: `PUT /api/clusters/{id}`
  - On success: Show toast, redirect to `/clusters`
  - On error: Show error message, keep form data

**Validation:**
- Client-side using react-hook-form
- Show inline errors below fields
- Disable submit button until form is valid

---

### 4.3 Manual Management

#### 4.3.1 Manual List Page

**Route:** `/manuals`

**Purpose:** View all uploaded training manuals

**Layout:**
```
+------------------+
| Header           |
+-----+------------+
| Nav | Manuals    |
|     | [+ Upload] |
|     | [Search]   |
|     |            |
|     | Table List |
|     | [View][Del]|
+-----+------------+
```

**Required Elements:**

1. **Action Bar**
   - "Upload Manual" button (primary)
   - Search input (filter by title)
   - Filter dropdown (by language)

2. **Manuals Table** (Desktop) / Cards (Mobile)
   - Columns:
     - Title
     - Language
     - Cluster (if associated)
     - Upload Date
     - Status (Indexed/Not Indexed)
     - Actions (View, Index, Delete)

3. **Status Badges**
   - 🟢 "Indexed" (green) - Ready for use
   - 🟡 "Processing" (yellow) - Indexing in progress
   - ⚪ "Not Indexed" (gray) - Click to index

4. **Index Action**
   - Button: "Index for RAG"
   - Disabled if already indexed
   - Shows loading state during indexing
   - API: `POST /api/manuals/{id}/index`

**API Calls:**
- `GET /api/manuals` → Display all
- `POST /api/manuals/{id}/index` → Index manual
- `DELETE /api/manuals/{id}` → Delete (with confirmation)

---

#### 4.3.2 Manual Upload Page

**Route:** `/manuals/upload`

**Purpose:** Upload new training manual PDFs

**Layout:**
```
+------------------+
| Header           |
+-----+------------+
| Nav | Upload     |
|     | Manual     |
|     |            |
|     | Drag Zone  |
|     | Form       |
|     | [Upload]   |
+-----+------------+
```

**Required Elements:**

1. **File Upload Zone** (react-dropzone)
   - Drag and drop area
   - Click to browse
   - Accept: `.pdf` only
   - Max size: 50MB
   - Show file preview after selection
   - Display: filename, size, remove button

2. **Manual Details Form**
   - **Title** (Text Input) - Required
   - **Description** (Textarea) - Optional
   - **Language** (Dropdown) - Required, from supported languages
   - **Associated Cluster** (Dropdown) - Optional, from `/api/clusters`

3. **Upload Button**
   - Disabled until file + title + language selected
   - Show progress bar during upload
   - API: `POST /api/manuals/upload` (multipart/form-data)

4. **Success Flow**
   - Show success toast
   - Ask: "Index this manual now?" (Yes/No)
   - If Yes: Call `POST /api/manuals/{id}/index`
   - Redirect to `/manuals`

**API Calls:**
- `GET /api/clusters` → For dropdown
- `GET /api/translation/languages` → For language dropdown
- `POST /api/manuals/upload` → Upload file

**FormData Structure:**
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('title', titleValue);
formData.append('language', languageValue);        // Required
formData.append('description', descriptionValue);  // Optional
formData.append('cluster_id', clusterIdValue);     // Optional
```

---

### 4.4 Module Generator (Main Feature)

#### 4.4.1 Module Generator Page

**Route:** `/modules/generate`

**Purpose:** Generate AI-adapted training modules

**Layout:** Split-screen design
```
+----------------------------------------+
| Header                                 |
+-----+----------------------------------+
| Nav | LEFT PANEL  |  RIGHT PANEL      |
|     | Original    |  Adapted          |
|     | Content     |  Content          |
|     |             |                   |
|     | [Manual ▼]  |  [Cluster ▼]      |
|     | [Paste]     |  [Language ▼]     |
|     |             |  [Generate]       |
|     | Text Area   |  Result Area      |
|     |             |  [Edit]           |
|     |             |  [Save Module]    |
+-----+-------------+-------------------+
```

**Left Panel: Original Content**

1. **Manual Selection** (Dropdown)
   - Fetch from `GET /api/manuals`
   - Show: Title, Language
   - Filter: Only show indexed manuals
   - Optional: Link to view full manual

2. **Original Content** (Textarea)
   - Large textarea for pasting text from manual
   - Placeholder: "Paste the text you want to adapt..."
   - Character count (min 50, max 5000)
   - Clear button

3. **Section Title** (Text Input)
   - Optional
   - Placeholder: "e.g., Chapter 3: Teaching Science"

**Right Panel: Adapted Content**

1. **Cluster Selection** (Dropdown)
   - Fetch from `GET /api/clusters`
   - Show: Name, Geographic Type, Language
   - Required
   - Display cluster details below dropdown

2. **Target Language** (Dropdown)
   - Options from `GET /api/translation/languages`
   - Default: Cluster's primary_language
   - Optional (defaults to English if not selected)

3. **Generate Button**
   - Primary button
   - Disabled until manual + original_content + cluster selected
   - Shows loading spinner during generation
   - Text: "Generate Adapted Module" → "Generating..." → "Generate Again"

4. **Result Display**
   - Initially empty with message: "Configure options and click Generate"
   - After generation: Show adapted content
   - Editable textarea (allow manual corrections)
   - Word count comparison (original vs adapted)

5. **Save Button**
   - Disabled until content is generated
   - Opens "Save Module" modal with:
     - Title input (auto-filled or editable)
     - Confirmation buttons
   - API: Save the module (no backend endpoint yet, just localStorage for MVP)
   - Success: Show toast, option to "Generate Another" or "View All Modules"

**API Calls:**
- `GET /api/manuals` → Dropdown options
- `GET /api/clusters` → Dropdown options
- `GET /api/translation/languages` → Language options
- `POST /api/modules/generate` → Generate module

**Request Body:**
```javascript
{
  manual_id: selectedManual.id,
  cluster_id: selectedCluster.id,
  original_content: originalText,           // 50-5000 chars
  target_language: selectedLanguage,        // Optional
  section_title: sectionTitle || "Module"   // Optional
}
```

**State Management:**
- Selected manual (object)
- Selected cluster (object)
- Original content (text)
- Target language (string)
- Adapted content (text from API)
- Loading state (boolean)
- Error state (string)

---

#### 4.4.2 Module List Page

**Route:** `/modules`

**Purpose:** Browse all generated modules

**Layout:**
```
+------------------+
| Header           |
+-----+------------+
| Nav | Modules    |
|     | [+ New]    |
|     | [Filters]  |
|     |            |
|     | Cards Grid |
|     | [View]     |
+-----+------------+
```

**Required Elements:**

1. **Action Bar**
   - "Generate New Module" button → `/modules/generate`
   - Search input (filter by title)
   - Filter dropdowns:
     - By Cluster
     - By Manual
     - By Language

2. **Module Cards Grid** (2 columns)
   - Display per card:
     - Title (h3)
     - Cluster name (badge)
     - Manual name (badge)
     - Language (badge)
     - Content preview (first 150 chars of adapted_content)
     - Created date
     - "View Details" button
     - Delete button (icon)

3. **Empty State**
   - Show when no modules
   - Message: "No modules generated yet. Create your first module!"
   - CTA: "Generate Module"

**API Calls:**
- `GET /api/modules?cluster_id={id}` → All modules (with optional filter)
- `DELETE /api/modules/{id}` → Delete module

---

#### 4.4.3 Module Detail Page

**Route:** `/modules/{id}`

**Purpose:** View full module with comparison

**Layout:**
```
+----------------------------------+
| Header                           |
+-----+----------------------------+
| Nav | Module Title               |
|     | Metadata (cluster, manual) |
|     |                            |
|     | [Tabs]                     |
|     | - Original                 |
|     | - Adapted                  |
|     | - Side by Side             |
|     |                            |
|     | Content Display            |
|     |                            |
|     | [Export PDF]               |
+-----+----------------------------+
```

**Required Elements:**

1. **Module Header**
   - Title (h1)
   - Metadata row:
     - Cluster name (with link to cluster detail)
     - Manual name (with link to manual detail)
     - Target language (badge)
     - Created date

2. **Tab Navigation**
   - Original Content (tab 1)
   - Adapted Content (tab 2)
   - Side-by-Side Comparison (tab 3)

3. **Content Display**
   - Tab 1: Show original_content in read-only format
   - Tab 2: Show adapted_content in read-only format
   - Tab 3: Split view with both contents side by side

4. **Actions**
   - Export as PDF button (future feature)
   - Share button (copy link)
   - Delete button (with confirmation)
   - Back to Modules button

**API Calls:**
- `GET /api/modules/{id}` → Fetch full module details

---

## 5. Component Specifications

### 5.1 Layout Components

#### Sidebar Component
**File:** `src/components/layout/Sidebar.jsx`

**Requirements:**
- Fixed left sidebar (250px width)
- Logo/App name at top
- Navigation menu items:
  - 🏠 Dashboard (`/`)
  - 🏫 Clusters (`/clusters`)
  - 📚 Manuals (`/manuals`)
  - ⚡ Module Generator (`/modules/generate`)
  - 📋 Modules Library (`/modules`)
- Active route highlighting
- Responsive: Collapse to hamburger on mobile

#### Header Component
**File:** `src/components/layout/Header.jsx`

**Requirements:**
- Breadcrumb navigation
- Page title (dynamic based on route)
- User info section (placeholder for future auth)
- System status indicator (backend health)

---

### 5.2 Common Components

#### Button Component
**File:** `src/components/common/Button.jsx`

**Props:**
```javascript
{
  variant: 'primary' | 'secondary' | 'danger' | 'ghost',
  size: 'sm' | 'md' | 'lg',
  loading: boolean,
  disabled: boolean,
  icon: ReactNode,
  children: ReactNode,
  onClick: function
}
```

**Variants:**
- Primary: Blue background, white text
- Secondary: Gray background, dark text
- Danger: Red background, white text
- Ghost: Transparent background, colored text

#### Card Component
**File:** `src/components/common/Card.jsx`

**Props:**
```javascript
{
  title: string,
  subtitle: string,
  children: ReactNode,
  footer: ReactNode,
  onClick: function
}
```

#### Select Component
**File:** `src/components/common/Select.jsx`

**Props:**
```javascript
{
  label: string,
  options: Array<{value, label}>,
  value: any,
  onChange: function,
  placeholder: string,
  error: string,
  required: boolean
}
```

---

## 6. API Service Implementation

### Base API Configuration
**File:** `src/services/api.js`

```javascript
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any global request modifications
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    const message = error.response?.data?.detail || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
```

### Cluster Service
**File:** `src/services/clusterService.js`

```javascript
import api from './api';

export const clusterService = {
  // Get all clusters
  getAll: async () => {
    const response = await api.get('/clusters');
    return response.data;
  },

  // Get cluster by ID
  getById: async (id) => {
    const response = await api.get(`/clusters/${id}`);
    return response.data;
  },

  // Create new cluster
  create: async (data) => {
    const response = await api.post('/clusters', data);
    return response.data;
  },

  // Update cluster
  update: async (id, data) => {
    const response = await api.put(`/clusters/${id}`, data);
    return response.data;
  },

  // Delete cluster
  delete: async (id) => {
    await api.delete(`/clusters/${id}`);
  },
};
```

### Manual Service
**File:** `src/services/manualService.js`

```javascript
import api from './api';

export const manualService = {
  // Get all manuals
  getAll: async () => {
    const response = await api.get('/manuals');
    return response.data;
  },

  // Upload manual
  upload: async (formData) => {
    const response = await api.post('/manuals/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        // Can emit progress updates here
      },
    });
    return response.data;
  },

  // Index manual
  index: async (id) => {
    const response = await api.post(`/manuals/${id}/index`);
    return response.data;
  },

  // Delete manual
  delete: async (id) => {
    await api.delete(`/manuals/${id}`);
  },
};
```

### Module Service
**File:** `src/services/moduleService.js`

```javascript
import api from './api';

export const moduleService = {
  // Get all modules
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/modules?${params}`);
    return response.data;
  },

  // Get module by ID
  getById: async (id) => {
    const response = await api.get(`/modules/${id}`);
    return response.data;
  },

  // Generate module
  generate: async (data) => {
    const response = await api.post('/modules/generate', data);
    return response.data;
  },

  // Delete module
  delete: async (id) => {
    await api.delete(`/modules/${id}`);
  },

  // Submit feedback
  submitFeedback: async (id, feedback) => {
    const response = await api.post(`/modules/${id}/feedback`, feedback);
    return response.data;
  },
};
```

### Translation Service
**File:** `src/services/translationService.js`

```javascript
import api from './api';

export const translationService = {
  // Get supported languages
  getLanguages: async () => {
    const response = await api.get('/translation/languages');
    return response.data;
  },

  // Translate text
  translate: async (text, targetLanguage, sourceLanguage = 'english') => {
    const response = await api.post('/translation/translate', {
      text,
      target_language: targetLanguage,
      source_language: sourceLanguage,
    });
    return response.data;
  },

  // Batch translate
  batchTranslate: async (texts, targetLanguage, sourceLanguage = 'english') => {
    const response = await api.post('/translation/translate/batch', {
      texts,
      target_language: targetLanguage,
      source_language: sourceLanguage,
    });
    return response.data;
  },
};
```

---

## 7. Design System

### Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-500: #3b82f6;  /* Main primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Secondary/Accent */
--accent-500: #f59e0b;   /* Orange */
--accent-600: #d97706;

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;

/* Semantic */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Spacing
```css
/* Following 8px grid */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

### Component Styling Guidelines
- Border radius: `0.5rem` (8px) for cards/buttons
- Box shadow: Subtle shadows for elevation
- Transitions: 150ms ease for hover states
- Focus states: 2px outline with primary color
- Disabled state: 50% opacity

---

## 8. Routing Structure

**File:** `src/App.jsx`

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import ClusterList from './pages/Clusters/ClusterList';
import ClusterForm from './pages/Clusters/ClusterForm';
import ManualList from './pages/Manuals/ManualList';
import ManualUpload from './pages/Manuals/ManualUpload';
import ModuleGenerator from './pages/Modules/ModuleGenerator';
import ModuleList from './pages/Modules/ModuleList';
import ModuleDetail from './pages/Modules/ModuleDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Clusters */}
          <Route path="clusters" element={<ClusterList />} />
          <Route path="clusters/new" element={<ClusterForm />} />
          <Route path="clusters/:id/edit" element={<ClusterForm />} />
          
          {/* Manuals */}
          <Route path="manuals" element={<ManualList />} />
          <Route path="manuals/upload" element={<ManualUpload />} />
          
          {/* Modules */}
          <Route path="modules" element={<ModuleList />} />
          <Route path="modules/generate" element={<ModuleGenerator />} />
          <Route path="modules/:id" element={<ModuleDetail />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 9. Development Workflow

### Phase 1: Setup (Day 1)
**Goal:** Development environment ready

**Tasks:**
1. Install all dependencies
2. Configure Tailwind CSS
3. Setup folder structure
4. Create base layout components (Sidebar, Header, MainLayout)
5. Setup routing
6. Create API service files with all functions
7. Test API connectivity with backend

**Deliverable:** 
- App loads with sidebar navigation
- Can navigate between empty pages
- API services can successfully call backend health endpoint

---

### Phase 2: Cluster Management (Day 2)
**Goal:** Complete cluster CRUD functionality

**Tasks:**
1. Create ClusterList page
2. Create ClusterForm page
3. Implement cluster API integration
4. Add form validation
5. Add success/error toasts
6. Test create, edit, delete workflows

**Deliverable:**
- Can create, view, edit, and delete clusters
- Form validation working
- Error handling in place

---

### Phase 3: Manual Management (Day 3)
**Goal:** Manual upload and listing

**Tasks:**
1. Create ManualList page
2. Create ManualUpload page
3. Implement file upload with progress
4. Integrate manual indexing
5. Add manual listing with status badges

**Deliverable:**
- Can upload PDF files
- Can index manuals
- Can view all uploaded manuals

---

### Phase 4: Module Generator (Days 4-5)
**Goal:** Core feature - module generation

**Tasks:**
1. Create split-screen layout
2. Implement left panel (manual selection, content input)
3. Implement right panel (cluster selection, generation)
4. Integrate module generation API
5. Add translation integration
6. Implement save functionality
7. Add loading states and error handling

**Deliverable:**
- Complete module generation workflow working
- Can generate, edit, and save modules
- Translation working

---

### Phase 5: Module Library (Day 6)
**Goal:** Browse and view generated modules

**Tasks:**
1. Create ModuleList page with filters
2. Create ModuleDetail page
3. Implement comparison views
4. Add delete functionality

**Deliverable:**
- Can view all modules
- Can filter modules
- Can view module details with comparison

---

### Phase 6: Dashboard & Polish (Day 7)
**Goal:** Complete dashboard and final polish

**Tasks:**
1. Create Dashboard with statistics
2. Add loading states everywhere
3. Add empty states for all lists
4. Polish UI/UX
5. Mobile responsiveness
6. Error boundary
7. Final testing

**Deliverable:**
- Complete, polished application
- All features working end-to-end
- Ready for demo

---

## 10. Testing Checklist

### Functional Testing

#### Clusters
- [ ] Can create a new cluster with all required fields
- [ ] Cannot create cluster with missing required fields
- [ ] Can edit existing cluster
- [ ] Can delete cluster (with confirmation)
- [ ] Can search/filter clusters
- [ ] Empty state shows when no clusters exist

#### Manuals
- [ ] Can upload PDF file
- [ ] Upload shows progress bar
- [ ] Cannot upload non-PDF files
- [ ] Can view list of uploaded manuals
- [ ] Can index a manual
- [ ] Indexed status badge shows correctly
- [ ] Can delete manual (with confirmation)

#### Module Generation
- [ ] Can select manual from dropdown (only indexed manuals)
- [ ] Can select cluster from dropdown
- [ ] Can paste/type original content
- [ ] Cannot generate without required fields
- [ ] Generate button shows loading state
- [ ] Adapted content displays correctly
- [ ] Can edit adapted content
- [ ] Can select translation language
- [ ] Can save generated module
- [ ] Success message shows after save

#### Module Library
- [ ] Can view all generated modules
- [ ] Can filter by cluster
- [ ] Can filter by manual
- [ ] Can search modules
- [ ] Can view module details
- [ ] Side-by-side comparison works
- [ ] Can delete module

### UI/UX Testing
- [ ] Navigation works on all pages
- [ ] Active route highlighted in sidebar
- [ ] Breadcrumbs show correct path
- [ ] All buttons have hover states
- [ ] Loading spinners show during API calls
- [ ] Success toasts show on successful actions
- [ ] Error messages show on failures
- [ ] Forms show validation errors
- [ ] Empty states show appropriate messages
- [ ] Responsive on tablet (768px+)
- [ ] Responsive on mobile (640px+)

### API Integration Testing
- [ ] All GET requests work
- [ ] All POST requests work
- [ ] All PUT requests work
- [ ] All DELETE requests work
- [ ] Network errors handled gracefully
- [ ] 404 errors handled
- [ ] 500 errors handled
- [ ] Loading states during all API calls

---

## 11. Known Limitations & Future Enhancements

### Current Limitations (MVP)
1. No user authentication/authorization
2. No role-based access control
3. No PDF viewer (just file upload)
4. No actual PDF export (placeholder)
5. No WhatsApp integration
6. No analytics/reporting
7. No bulk operations
8. No version history for modules

### Future Enhancements (Post-MVP)
1. **Authentication:** Add user login/logout
2. **PDF Viewer:** Inline PDF viewing with highlighting
3. **Rich Text Editor:** Better content editing experience
4. **Export:** PDF/Word export of modules
5. **WhatsApp:** Direct sharing to WhatsApp groups
6. **Analytics:** Module usage statistics, teacher feedback analysis
7. **Feedback System:** Teacher feedback collection and visualization
8. **Bulk Operations:** Upload multiple manuals, generate multiple modules
9. **Version Control:** Track changes to modules over time
10. **Collaboration:** Multiple admins working together

---

## 12. Performance Targets

### Page Load Times
- Dashboard: < 2 seconds
- List pages: < 1 second
- Detail pages: < 1.5 seconds
- Module generation: < 30 seconds (backend dependent)

### Bundle Size
- Initial JS bundle: < 500KB (gzipped)
- Images optimized: < 100KB each
- Lazy load routes for better performance

### Lighthouse Scores (Target)
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

---

## 13. Deployment Considerations

### Environment Variables
```bash
# .env file
VITE_API_BASE_URL=http://localhost:8000/api
```

### Build Command
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Production URL
- Backend: `http://localhost:8000` (or production URL)
- Frontend: Will be served on `localhost:5173` (dev) or port 4173 (preview)

---

## 14. Support & Resources

### Documentation Links
- React: https://react.dev
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- React Hook Form: https://react-hook-form.com
- React Icons: https://react-icons.github.io/react-icons
- Axios: https://axios-http.com

### Backend API Documentation
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Project Resources
- Backend README: `backend/README.md`
- Backend Status: `PRD/Backend_Phase1_COMPLETE.md`
- Original PRD: `PRD/Shiksha-Setu_Product_Requirements_Document.md`

---

## 15. Success Criteria

The frontend Phase 2 will be considered complete when:

1. ✅ All pages are implemented and functional
2. ✅ All API endpoints are integrated
3. ✅ Complete end-to-end workflow works:
   - Create cluster → Upload manual → Index manual → Generate module → View module
4. ✅ All CRUD operations work for clusters, manuals, and modules
5. ✅ Translation integration works
6. ✅ Error handling and loading states are in place
7. ✅ UI is clean, professional, and responsive
8. ✅ No console errors
9. ✅ Successfully demonstrates the core value proposition of Shiksha-Setu

---

**Document Version:** 1.1  
**Last Updated:** January 15, 2026  
**Prepared By:** Shiksha-Setu Development Team  
**Status:** Backend API Updated - Ready for Frontend Development  

**Changelog:**
- **v1.1 (Jan 15, 2026):** Updated all API schemas to match actual backend implementation, added database migration script, corrected field names
- **v1.0 (Jan 13, 2026):** Initial frontend requirements document

---

## Appendix A: Quick Start Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional packages
npm install react-icons react-hot-toast @headlessui/react
npm install react-hook-form react-dropzone

# Start development server
npm run dev

# Backend should already be running at:
# http://localhost:8000
```

---

## Appendix B: Example API Responses

### GET /api/clusters
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
    "created_at": "2026-01-13T10:00:00",
    "updated_at": "2026-01-13T10:00:00"
  }
]
```

### POST /api/modules/generate Response
```json
{
  "id": 1,
  "title": "Adapted Module: Teaching Science Without Lab",
  "original_content": "To teach photosynthesis, use a microscope to observe leaf cells...",
  "adapted_content": "To teach photosynthesis without a microscope, collect local leaves and use sunlight observation methods. Ask students to...",
  "manual_id": 1,
  "cluster_id": 1,
  "target_language": "marathi",
  "section_title": "Teaching Science Without Lab",
  "metadata": "{\"cluster_name\": \"Tribal Belt Schools\", \"manual_title\": \"Science Teaching Manual\", \"generated_at\": \"2026-01-13T11:30:00\"}",
  "created_at": "2026-01-13T11:30:00",
  "updated_at": "2026-01-13T11:30:00"
}
```

---

**END OF DOCUMENT**
