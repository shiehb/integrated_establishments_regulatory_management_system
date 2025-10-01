# System Configuration Management

This document describes the new system configuration management feature that allows administrators to edit email settings, default passwords, and access token configurations through the frontend interface.

## Features

### 1. Email Configuration
- **SMTP Host**: Configure the email server host (default: smtp.gmail.com)
- **SMTP Port**: Set the email server port (default: 587)
- **Email Username**: Gmail or other email service username
- **Email Password**: Email service password or app-specific password
- **Default From Email**: Default sender email address
- **Use TLS**: Enable/disable TLS encryption
- **Email Test**: Test email configuration by sending a test email

### 2. Default Password Configuration
- **Default User Password**: Set the default password for new users
- Users will be required to change this password on first login

### 3. Access Token Configuration
- **Access Token Lifetime**: How long access tokens remain valid (5-1440 minutes)
- **Refresh Token Lifetime**: How long refresh tokens remain valid (1-365 days)
- **Rotate Refresh Tokens**: Enable token rotation for security
- **Blacklist After Rotation**: Blacklist old tokens after rotation

## Setup Instructions

### 1. Backend Setup

1. **Run Migrations**:
   ```bash
   cd server
   python manage.py makemigrations system_config
   python manage.py migrate
   ```

2. **Initialize Configuration** (Optional):
   ```bash
   python manage.py init_system_config
   ```

### 2. Frontend Access

1. **Login as Admin**: Only users with "Admin" role can access system configuration
2. **Navigate to System Configuration**: Use the sidebar menu or go to `/system-config`
3. **Edit Settings**: Modify the configuration as needed
4. **Test Email**: Use the email test feature to verify email settings
5. **Save Changes**: Click "Save Configuration" to apply changes

## API Endpoints

The following API endpoints are available for system configuration:

- `GET /api/system/config/` - Get current configuration
- `PUT /api/system/config/update/` - Update configuration
- `POST /api/system/config/test-email/` - Test email configuration
- `GET /api/system/config/current-settings/` - Get current Django settings

## Security Features

1. **Admin Only Access**: Only admin users can access and modify system configuration
2. **Password Masking**: Email passwords are masked in the UI for security
3. **Input Validation**: All inputs are validated on both frontend and backend
4. **Audit Logging**: Configuration changes are logged in the audit system

## Configuration Priority

The system uses the following priority order for configuration:

1. **Database Configuration** (highest priority) - Set through the frontend
2. **Environment Variables** (fallback) - Set in .env file
3. **Default Values** (lowest priority) - Hardcoded defaults

## Troubleshooting

### Email Configuration Issues

1. **Gmail Setup**: 
   - Use App Passwords instead of your regular Gmail password
   - Enable 2-factor authentication first
   - Generate an app-specific password in Gmail settings

2. **Other Email Providers**:
   - Check SMTP settings with your email provider
   - Ensure correct port numbers (587 for TLS, 465 for SSL)
   - Verify username and password are correct

### Token Configuration Issues

1. **Access Token Too Short**: May cause frequent re-authentication
2. **Access Token Too Long**: Security risk if token is compromised
3. **Refresh Token Issues**: Ensure rotation and blacklisting are properly configured

## Database Schema

The `SystemConfiguration` model stores all configuration settings:

```python
class SystemConfiguration(models.Model):
    # Email settings
    email_host = models.CharField(max_length=255)
    email_port = models.IntegerField()
    email_use_tls = models.BooleanField()
    email_host_user = models.EmailField()
    email_host_password = models.CharField()
    default_from_email = models.EmailField()
    
    # Password settings
    default_user_password = models.CharField()
    
    # JWT settings
    access_token_lifetime_minutes = models.IntegerField()
    refresh_token_lifetime_days = models.IntegerField()
    rotate_refresh_tokens = models.BooleanField()
    blacklist_after_rotation = models.BooleanField()
    
    # Metadata
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    is_active = models.BooleanField()
```

## Notes

- Configuration changes take effect immediately after saving
- Email test feature sends a test email to verify configuration
- All configuration changes are logged in the audit system
- Only one active configuration can exist at a time
- The system automatically falls back to environment variables if database configuration is not available


Recommendations to add to the Admin Dashboard
Key KPIs at a glance
Total establishments; active vs inactive
Upcoming inspections (next 7/30 days)
Compliance status breakdown (compliant, overdue, at-risk)
Open violations and average resolution time
User activity today/this week (logins, updates)
Trends and insights
Inspections per month with pass/fail rates
Top non‑compliance categories
Map heatmap of inspections or violations by municipality
Repeat offenders list
Actionable queues
Pending inspection assignments needing reviewer
Overdue corrective actions with days overdue
Draft reports awaiting approval/signature
New establishments pending verification
Smart search and filters (global)
Search across establishments, users, inspections
Quick filters: municipality, sector, risk level, date range
Saved filter presets per role
Role‑aware widgets
Admin: user management quick actions; system health
Section/Unit Heads: team workload, assignment balance
Inspectors: today’s route, next tasks, one‑click start report
Quick actions
Create inspection
Register establishment
Assign inspector
Export compliance report (CSV/PDF)
Activity log improvements
Filter by module/user/action/date
“Follow” an establishment/user to get highlighted events
One‑click export of filtered logs
Compliance risk panel
High‑risk establishments (risk score, last inspection, open issues)
Predictive flag: nearing permit expiry or repeated minor violations
Permit and expiry tracking
Upcoming permit/license expirations
Auto‑email/SMS reminders (configurable lead time)
Quality and performance
Average time from inspection to report issuance
Average time from violation to closure
SLA breach warnings
System health (admin only)
Email queue status, error rates
Recent failed login attempts
Storage usage for uploads
Export and reporting
One‑click monthly inspection summary PDF
CSV exports for establishments, inspections, violations (respect filters)
UX polish
Empty‑state guidance and contextual help links
Per‑widget date ranges
Dark mode and density toggle
Accessible keyboard navigation and ARIA labels
Quick wins (implement first)
KPIs row (4–6 cards)
Upcoming inspections list
Overdue corrective actions list
Global search + saved filters
Activity log filters and export