# Fake Data Generator

## Overview
This script generates realistic demo data for the Shiksha-Setu platform to populate admin and school dashboards with meaningful test data.

## What Data is Generated

### Schools (20)
- Government, Municipal, and Kendriya Vidyalaya schools
- Across 8 major Indian states
- Various school types (Primary, High School, Higher Secondary)
- Realistic district and state assignments

### Users
1. **Admins (2)**
   - Dr. Rajesh Kumar (admin@shiksha-setu.gov.in)
   - Dr. Anita Verma (admin2@shiksha-setu.gov.in)
   - Password: `admin123`

2. **Principals (15-30)**
   - 1-2 principals per school
   - Email format: firstname.lastname@principal.district.edu
   - Password: `principal123`

3. **Teachers (60-160)**
   - 3-8 teachers per school
   - Email format: firstname.lastname@district.edu
   - Password: `teacher123`
   - 70% have recent login activity

### Training Data
1. **Clusters (30)**
   - Mix of Urban, Rural, and Tribal
   - 8 Indian languages (Hindi, Marathi, Tamil, etc.)
   - Different infrastructure levels
   - Various training topics

2. **Manuals (25)**
   - Linked to clusters
   - Multiple languages
   - Topics: Digital Teaching, Classroom Management, etc.

3. **Modules (100)**
   - Linked to manuals and clusters
   - 70% approved, 30% pending
   - Realistic content for each language and region

## How to Run

### Method 1: Using PowerShell
```powershell
cd backend
python generate_fake_data.py
```

### Method 2: Direct execution
```powershell
python backend/generate_fake_data.py
```

## Features

- **Realistic Data**: Indian names, locations, and educational contexts
- **Random Dates**: Login times, creation dates spread over realistic periods
- **Approval Workflow**: Mix of approved and pending modules
- **Activity Tracking**: Some teachers active, some inactive
- **Pinned Items**: Random important clusters and manuals marked as pinned

## Safety

- Asks for confirmation before clearing existing data
- Uses transactions for data integrity
- Can be run multiple times safely

## After Generation

You can test all dashboards:
- **Admin Dashboard**: Shows all schools, teachers, and platform metrics
- **Principal Dashboard**: Shows school-specific data and teacher performance
- **Teacher Dashboard**: Shows clusters and training modules

## Sample Login Credentials

After generation, use these credentials:

- **Admin**: admin@shiksha-setu.gov.in / admin123
- **Principal**: Check console output for specific emails / principal123
- **Teacher**: Check console output for specific emails / teacher123

Last Updated: January 19, 2026
