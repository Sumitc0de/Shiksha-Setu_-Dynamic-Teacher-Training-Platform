# Authentication System - Setup Guide

## Overview

The authentication system has been implemented with three user roles:
- **ADMIN** (Government Officials) - Monitor all schools and universities
- **PRINCIPAL** (School Administrators) - Monitor teachers in their school
- **TEACHER** (Main Users) - Create training modules

## Backend Setup

### 1. Install Additional Dependencies

```powershell
cd backend
venv\Scripts\Activate.ps1
pip install pyjwt==2.9.0 passlib[bcrypt]==1.7.4 bcrypt==4.2.1
```

### 2. Initialize Test Users

Run the initialization script to create test users:

```powershell
python init_auth_users.py
```

This creates:
- 3 test schools (Mumbai, Delhi, Bangalore)
- 1 Admin user
- 2 Principal users
- 3 Teacher users

### 3. Start Backend Server

```powershell
python main.py
```

The backend will run on http://localhost:8000

## Frontend Setup

### 1. Install Dependencies (if not already done)

```powershell
cd frontend
npm install
```

### 2. Start Frontend Server

```powershell
npm run dev
```

The frontend will run on http://localhost:3000

## Login Credentials

### Admin (Government Official)
- **Email**: `admin@shiksha-setu.gov.in`
- **Password**: `admin123`
- **Access**: View all schools, teachers, clusters, and modules across the system

### Principal (Mumbai Government School)
- **Email**: `principal.mumbai@school.edu`
- **Password**: `principal123`
- **Access**: Monitor teachers and activities in Mumbai School only

### Principal (Delhi Public University)
- **Email**: `principal.delhi@university.edu`
- **Password**: `principal123`
- **Access**: Monitor teachers and activities in Delhi University only

### Teacher (Mumbai)
- **Email**: `priya.deshmukh@school.edu`
- **Password**: `teacher123`
- **Access**: Full platform features - create clusters and modules

### Teacher (Delhi)
- **Email**: `amit.patel@school.edu`
- **Password**: `teacher123`
- **Access**: Full platform features - create clusters and modules

### Teacher (Bangalore)
- **Email**: `lakshmi.reddy@school.edu`
- **Password**: `teacher123`
- **Access**: Full platform features - create clusters and modules

## Features by Role

### ADMIN Dashboard
- **Overview Tab**: System-wide statistics and recent activities
- **Schools Tab**: List all schools with their metrics
- **Teachers Tab**: List all teachers across all schools
- View total schools, teachers, clusters, manuals, and modules
- Monitor system-wide activity

### PRINCIPAL Dashboard
- **Overview Tab**: School statistics and information
- **Teachers Tab**: Performance metrics for all teachers in their school
- **Clusters Tab**: All training clusters created by their teachers
- **Modules Tab**: All modules with approval status
- Monitor teacher activity and module creation
- View pending and approved modules

### TEACHER Dashboard
- **Cover Page**: Platform introduction and statistics
- **Clusters**: Create and manage training clusters
- **Manuals**: Upload and index training manuals
- **Generate**: Create AI-powered training modules
- **Library**: View and manage created modules
- **Translate**: Translate modules to regional languages

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/dashboard/stats` - Get dashboard statistics
- `POST /api/auth/logout` - User logout

### Admin (Requires ADMIN role)
- `GET /api/admin/overview` - Complete system overview
- `GET /api/admin/schools` - List all schools
- `GET /api/admin/schools/{id}` - Get school details
- `GET /api/admin/teachers` - List all teachers

### Schools (Requires PRINCIPAL role)
- `GET /api/schools/dashboard` - School dashboard
- `GET /api/schools/teachers` - List teachers in school
- `GET /api/schools/teachers/{id}` - Get teacher details
- `GET /api/schools/clusters` - List clusters in school
- `GET /api/schools/modules` - List modules in school

## Testing the System

1. **Start Backend**: `cd backend && python main.py`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: http://localhost:3000
4. **Login**: Use any of the credentials above
5. **Explore**: Each role will see a different dashboard

## Architecture

```
Frontend (React)
├── LoginPage.jsx - Authentication UI
├── AdminDashboard.jsx - Government admin view
├── PrincipalDashboard.jsx - School admin view
└── CoverPage.jsx (& other pages) - Teacher view

Backend (FastAPI)
├── api/
│   ├── auth.py - Authentication endpoints
│   ├── admin.py - Admin-only endpoints
│   └── schools.py - Principal endpoints
└── models/
    └── database_models.py - User, School, Role models
```

## Security Features

- JWT token-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- Protected API endpoints
- Automatic token validation
- Session management

## Notes

- Tokens expire after 30 minutes (configurable)
- Passwords are securely hashed with bcrypt
- Admin can see all data across schools
- Principals can only see their school's data
- Teachers can only see their own clusters/modules
- Quick demo login buttons available on login page

## Troubleshooting

### Backend won't start
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Run `python init_auth_users.py` to initialize the database

### Can't login
- Check that backend is running on port 8000
- Verify credentials match those listed above
- Check browser console for errors

### Dashboard not loading
- Ensure you're logged in with the correct role
- Check that the token is stored in localStorage
- Verify API endpoints are responding (check Network tab)

## Future Enhancements

- Password reset functionality
- Email verification
- Two-factor authentication
- User profile management
- Bulk user import
- Advanced analytics
- Export reports
