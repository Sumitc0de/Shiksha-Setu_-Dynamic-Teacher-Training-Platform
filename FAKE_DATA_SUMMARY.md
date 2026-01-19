# Fake Data Generation - Summary

## Generated Successfully on January 19, 2026

### Data Statistics

- **Schools**: 20 schools across 8 Indian states
- **Users**: 131 total users
  - **Admins**: 2
  - **Principals**: 21  
  - **Teachers**: 108
- **Clusters**: 30 training clusters
- **Manuals**: 25 training manuals
- **Modules**: 100 training modules

### Login Credentials

All passwords are set for demo purposes:

1. **Admin Access**:
   - Email: `admin@shiksha-setu.gov.in`
   - Password: `admin123`
   - Secondary: `admin2@shiksha-setu.gov.in` / `admin123`

2. **Principal Access**:
   - Any principal email (check database or console output)
   - Password: `principal123`
   - Example domains: `@principal.{district}.edu`

3. **Teacher Access**:
   - Any teacher email (check database or console output)
   - Password: `teacher123`
   - Example domains: `@{district}.edu`

### Data Distribution

#### Schools by Type
- Government Schools
- Municipal Schools  
- Zilla Parishad Schools
- Kendriya Vidyalaya Schools
- State Schools

#### Geographic Coverage
- Maharashtra, Karnataka, Tamil Nadu
- Gujarat, West Bengal, Rajasthan
- Uttar Pradesh, Madhya Pradesh

#### Training Clusters
- Mix of Urban, Rural, and Tribal regions
- 8 Indian languages supported
- Various infrastructure levels (High/Medium/Low)
- Topics: Digital Literacy, Inclusive Education, Assessment Methods, etc.

#### Modules Status
- ~70% approved modules
- ~30% pending approval
- Realistic creation dates spanning 120 days

### Dashboard Features Now Populated

#### Admin Dashboard
- Total platform statistics
- School performance metrics
- Teacher activity tracking
- Module approval rates
- Top performing schools visualization

#### Principal/School Dashboard
- School-specific metrics
- Teacher performance data
- Module creation and approval stats
- Cluster activity
- Student engagement metrics

### Next Steps

1. Start the application: `npm run dev` (frontend) and `python backend/main.py` (backend)
2. Login with admin credentials to view full platform metrics
3. Login as principal to see school-specific dashboards
4. Login as teacher to test training module creation

### Regenerating Data

To regenerate with fresh data:
```bash
python backend/generate_fake_data.py
```
And type `yes` when prompted to clear existing data.

Last Generated: January 19, 2026, 12:57 PM
