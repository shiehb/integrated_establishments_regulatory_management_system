# Inspection System - Quick Start Guide

## 🚀 Quick Integration Steps

### 1. Backend Setup (5 minutes)

#### Option A: Use New Refactored Models (Recommended for New Systems)

```bash
# Navigate to server directory
cd server

# Update your INSTALLED_APPS in settings.py (if not already done)
# The 'inspections' app should already be listed

# Run migrations
python manage.py makemigrations inspections
python manage.py migrate

# Update urls.py to use the refactored views
```

**Update `server/inspections/urls.py`:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_refactored import InspectionViewSet

router = DefaultRouter()
router.register(r'inspections', InspectionViewSet, basename='inspection')

urlpatterns = [
    path('', include(router.urls)),
]
```

#### Option B: Gradual Migration (For Existing Systems)

Keep both old and new models temporarily:
```python
# server/inspections/urls.py
from .views import InspectionViewSet as OldInspectionViewSet
from .views_refactored import InspectionViewSet as NewInspectionViewSet

router = DefaultRouter()
router.register(r'inspections', NewInspectionViewSet, basename='inspection')
router.register(r'inspections-old', OldInspectionViewSet, basename='inspection-old')
```

### 2. Frontend Setup (5 minutes)

#### Add Routes to Your Application

**If using React Router v6 (in `src/main.jsx` or `App.jsx`):**
```javascript
import InspectionDashboard from './pages/InspectionDashboard';
import InspectionDetail from './components/inspections/InspectionDetail';

// Add these routes
<Routes>
  {/* Existing routes */}
  
  {/* New inspection routes */}
  <Route path="/inspections" element={<InspectionDashboard />} />
  <Route path="/inspections/:id" element={<InspectionDetail />} />
</Routes>
```

#### Update Navigation Menu

Add a link to inspections in your navigation:
```javascript
<nav>
  {/* Existing nav items */}
  <Link to="/inspections">Inspections</Link>
</nav>
```

### 3. Create Test Users (2 minutes)

```bash
# Access Django shell
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
User = get_user_model()

# Create Division Chief
division_chief = User.objects.create_user(
    email='division@test.com',
    password='Test@123',
    first_name='John',
    last_name='Division',
    userlevel='Division Chief',
    is_active=True
)

# Create Section Chief for EIA
section_chief = User.objects.create_user(
    email='section@test.com',
    password='Test@123',
    first_name='Jane',
    last_name='Section',
    userlevel='Section Chief',
    section='PD-1586',
    district='La Union - 1st District',
    is_active=True
)

# Create Unit Head for EIA
unit_head = User.objects.create_user(
    email='unit@test.com',
    password='Test@123',
    first_name='Bob',
    last_name='Unit',
    userlevel='Unit Head',
    section='PD-1586',
    district='La Union - 1st District',
    is_active=True
)

# Create Monitoring Personnel
monitoring = User.objects.create_user(
    email='monitor@test.com',
    password='Test@123',
    first_name='Alice',
    last_name='Monitor',
    userlevel='Monitoring Personnel',
    section='PD-1586',
    district='La Union - 1st District',
    is_active=True
)

# Create Legal Unit
legal = User.objects.create_user(
    email='legal@test.com',
    password='Test@123',
    first_name='Mike',
    last_name='Legal',
    userlevel='Legal Unit',
    is_active=True
)

print("Test users created successfully!")
```

### 4. Create Test Establishment (1 minute)

```python
from establishments.models import Establishment

establishment = Establishment.objects.create(
    name='Test Manufacturing Corp',
    nature_of_business='Manufacturing',
    year_established='2020',
    province='La Union',
    city='San Fernando',
    barangay='Catbangen',
    street_building='123 Test Street',
    postal_code='2500',
    latitude=16.6163,
    longitude=120.3178
)

print("Test establishment created!")
```

### 5. Test the Workflow (10 minutes)

#### Test Compliant Path

1. **Login as Division Chief** (`division@test.com` / `Test@123`)
   - Navigate to `/inspections`
   - Click "Create New Inspection"
   - Select the test establishment
   - Select law: PD-1586
   - Set schedule and notes
   - Submit

2. **Login as Section Chief** (`section@test.com` / `Test@123`)
   - Go to "Received Inspections" tab
   - Click "Assign to Me"
   - Click "Start"
   - Click "Complete"
   - Click "Forward"

3. **Login as Unit Head** (`unit@test.com` / `Test@123`)
   - Go to "Received Inspections" tab
   - Click "Start"
   - Click "Complete"
   - Click "Forward"

4. **Login as Monitoring** (`monitor@test.com` / `Test@123`)
   - Go to "Assigned Inspections" tab
   - Click "Start"
   - Click "Complete"
   - Select "Compliant ✅"
   - Add findings summary
   - Submit

5. **Login as Unit Head** (again)
   - Go to "Review List" tab
   - Click "Review & Forward"

6. **Login as Section Chief** (again)
   - Go to "Review List" tab
   - Click "Review & Forward"

7. **Login as Division Chief** (again)
   - Go to "Tracking" tab
   - Click "Close" (for compliant case)

#### Test Non-Compliant Path

Follow steps 1-4 above, but:
- At step 4, select "Non-Compliant ❌"
- Add violations (required)
- Continue through reviews (steps 5-7)

8. **Login as Division Chief**
   - Click "Forward to Legal"

9. **Login as Legal Unit** (`legal@test.com` / `Test@123`)
   - Go to "Non-Compliant Cases" tab
   - Click "Send NOV"
   - Fill in violation details and deadline
   - Submit
   - Click "Send NOO"
   - Fill in penalty fees and breakdown
   - Submit
   - Click "Close"

---

## 🔧 Configuration Options

### File Upload Settings

**In `settings.py`:**
```python
# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Maximum upload size (10MB)
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
```

**In `urls.py`:**
```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your patterns
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### CORS Settings (if Frontend is separate)

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative React dev server
]
```

### Auto-Assignment Logic

The system auto-assigns personnel based on:
1. **Law/Section**: User's `section` field must match inspection's `law`
2. **District**: User's `district` field should match inspection's `district`
3. **Active Status**: User must have `is_active=True`
4. **User Level**: Appropriate level for the workflow state

**Fallback Strategy:**
- First tries exact district match
- Then tries any user with matching law
- Finally leaves unassigned if no match

---

## 📊 Role-Based Dashboard Views

### Division Chief
- **Create Tab**: Wizard to create inspections
- **Tracking Tab**: View all created inspections and those ready for review

### Section Chief
- **Received Tab**: New assignments from Division Chief
- **My Inspections Tab**: Currently working on
- **Forwarded Tab**: Forwarded to Unit/Monitoring (view only)
- **Review Tab**: Returned from Unit for review

### Unit Head
- **Received Tab**: Forwarded from Section Chief
- **My Inspections Tab**: Currently working on
- **Forwarded Tab**: Forwarded to Monitoring (view only)
- **Review Tab**: Returned from Monitoring for review

### Monitoring Personnel
- **Assigned Tab**: All assigned inspections

### Legal Unit
- **Non-Compliant Cases Tab**: All cases forwarded from Division Chief

---

## 🎨 Customization Tips

### Custom Status Colors

Edit `InspectionTable.jsx`:
```javascript
const statusColors = {
  'Created': 'bg-gray-100 text-gray-800',
  'New – Waiting for Action': 'bg-blue-100 text-blue-800',
  // ... customize colors
};
```

### Additional Laws

Add new laws in both backend and frontend:

**Backend (`models_refactored.py`):**
```python
def save(self, *args, **kwargs):
    prefix_map = {
        "PD-1586": "EIA",
        "RA-6969": "TOX",
        "NEW-LAW": "NEW",  # Add here
    }
```

**Frontend (`CreateInspectionWizard.jsx`):**
```javascript
const laws = [
  // ... existing laws
  { code: 'NEW-LAW', name: 'New Law Description' },
];
```

### Email Notifications

Add to workflow actions in `views_refactored.py`:
```python
from django.core.mail import send_mail

def _send_notification(self, inspection, action):
    if inspection.assigned_to and inspection.assigned_to.email:
        send_mail(
            subject=f'Inspection {inspection.code} - {action}',
            message=f'You have been assigned inspection {inspection.code}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[inspection.assigned_to.email],
            fail_silently=True
        )
```

---

## 🐛 Troubleshooting

### Issue: "Cannot transition to status X"
**Solution**: Check the workflow state machine. You may be skipping required states.

### Issue: "No personnel found for next status"
**Solution**: Ensure users have correct `section`, `district`, and `userlevel` fields set.

### Issue: "Violations required for non-compliant"
**Solution**: When marking as non-compliant, violations_found field must be filled.

### Issue: Auto-assignment not working
**Solution**: Check that users have:
- `is_active=True`
- Correct `section` matching the inspection's `law`
- Correct `district` (or leave blank for fallback)

---

## 📚 Next Steps

1. ✅ Read the full implementation guide: `INSPECTION_WORKFLOW_IMPLEMENTATION.md`
2. ✅ Review the workflow diagram in the guide
3. ✅ Test all role-based workflows
4. ✅ Customize status labels and colors
5. ✅ Add email notifications (optional)
6. ✅ Set up file upload storage
7. ✅ Create production users
8. ✅ Train users on the system

---

## 🎯 Key Features Summary

✨ **Multiple Establishments per Inspection** (M2M relationship)
✨ **18-State Workflow** with validated transitions
✨ **Auto-Assignment** based on law and district
✨ **Role-Based Dashboards** with customized tabs
✨ **Complete History Tracking** for audit trail
✨ **Document Management** with categorization
✨ **Status Progress Visualization** with stepper
✨ **Compliant/Non-Compliant Paths** with validations
✨ **Legal Unit Integration** (NOV/NOO)

---

**Need Help?** Check the detailed guide in `INSPECTION_WORKFLOW_IMPLEMENTATION.md`

**Version**: 1.0  
**Last Updated**: October 4, 2025

