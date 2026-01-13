# Backend Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: ImportError - Cannot import 'Cluster' from 'models'

**Error:**
```
ImportError: cannot import name 'Cluster' from 'models' (unknown location)
```

**Solution:**
This has been fixed by updating imports to use explicit module paths. Make sure you have the latest code.

### Issue 2: ModuleNotFoundError: No module named 'sentence_transformers'

**Error:**
```
ModuleNotFoundError: No module named 'sentence_transformers'
```

**Solution:**
Install dependencies in the virtual environment:
```powershell
cd backend
venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Issue 3: Server Takes Long Time to Start (First Run)

**Symptom:**
The server appears to hang or freeze when starting for the first time.

**Explanation:**
This is NORMAL! The first time you run the server, it needs to:
- Load large ML libraries (transformers, sentence-transformers, scikit-learn)
- Initialize the AI models
- This can take 30-60 seconds

**Solution:**
Be patient and wait. Subsequent starts will be faster.

## Proper Way to Start Backend

### Option 1: Using Virtual Environment (Recommended)

```powershell
cd backend
venv\Scripts\python.exe main.py
```

### Option 2: Using the Startup Script

From the project root:
```powershell
.\start.bat
```

## Python 3.13+ Compatibility

The codebase has been updated to work with Python 3.13 by using explicit imports:
- `from models.database_models import Cluster` instead of `from models import Cluster`
- `from schemas.api_schemas import ClusterCreate` instead of `from schemas import ClusterCreate`

## Requirements

- Python 3.10 - 3.14
- Virtual environment with all dependencies installed
- Compatible versions:
  - sentence-transformers==3.3.1
  - transformers==4.48.1

---

**Last Updated:** January 13, 2026
