# 🔐 IERMS Login Security & Alert System

## 📊 **Login Attempt Configuration**

### **Current Settings:**
- **Maximum Failed Attempts**: 5 attempts
- **Account Lockout Duration**: 15 minutes
- **Security Alert Threshold**: 3 failed attempts
- **Auto-unlock**: Yes (after lockout period expires)

### **Security Levels:**

| Attempts | Action | Email Alert |
|----------|--------|-------------|
| 1-2 | Logged only | ❌ No |
| 3-4 | Logged + Security Alert | ✅ **Security Alert Email** |
| 5+ | **Account Locked** | ✅ **Lockout Alert Email** |

---

## 🚨 **Security Alert Email Types**

### 1. **Failed Login Attempt Alert**
**Triggered**: After 3+ failed login attempts
**Priority**: HIGH
**Content**:
- Number of failed attempts
- IP address and location
- User agent information
- Security recommendations
- Action buttons for password reset

### 2. **Account Lockout Alert**
**Triggered**: After 5 failed login attempts
**Priority**: CRITICAL
**Content**:
- Lockout duration (15 minutes)
- Security recommendations
- Emergency contact information
- Account unlock instructions

### 3. **Password Change Confirmation**
**Triggered**: When password is successfully changed
**Priority**: NORMAL
**Content**:
- Confirmation of password change
- Security recommendations
- Contact information if unauthorized

---

## 📧 **Security Alert Email Preview**

### **Failed Login Alert Email:**
```
🚨 FAILED LOGIN ATTEMPTS DETECTED

Dear [User Name],

Multiple failed login attempts have been detected on your IERMS account. 
This may indicate an unauthorized access attempt.

SECURITY EVENT DETAILS:
- Account Email: user@example.com
- Event Type: Failed Login Attempts
- IP Address: 192.168.1.100
- Failed Attempts: 3 attempts
- Location: San Fernando City, La Union

⚠️ IMMEDIATE ACTION REQUIRED
If this was you attempting to log in, please ensure you're using the correct password.

🔒 SECURITY RECOMMENDATIONS
- Change your password if you suspect unauthorized access
- Enable two-factor authentication when available
- Log out from all devices and log in again
- Review your account activity regularly

[RESET PASSWORD] [ACCESS ACCOUNT]
```

### **Account Lockout Alert Email:**
```
🚨 ACCOUNT TEMPORARILY LOCKED

Dear [User Name],

Your account has been temporarily locked due to multiple failed login attempts. 
This is a security measure to protect your account.

SECURITY EVENT DETAILS:
- Account Email: user@example.com
- Event Type: Account Lockout
- Lockout Duration: 15 minutes
- Failed Attempts: 5 attempts

⚠️ IMMEDIATE ACTION REQUIRED
Your account will be automatically unlocked in 15 minutes. 
To unlock immediately, contact IT Support.

[RESET PASSWORD] [CONTACT SUPPORT]
```

---

## 🛠️ **How It Works**

### **1. Login Process Flow:**
```
User attempts login
    ↓
Check if account is locked
    ↓
If locked → Return error
    ↓
If not locked → Validate credentials
    ↓
If valid → Reset failed attempts + Log success
    ↓
If invalid → Increment failed attempts
    ↓
If attempts >= 3 → Send Security Alert
    ↓
If attempts >= 5 → Lock account + Send Lockout Alert
```

### **2. Database Fields Added:**
```python
# New fields in User model:
failed_login_attempts = models.PositiveIntegerField(default=0)
last_failed_login = models.DateTimeField(null=True, blank=True)
account_locked_until = models.DateTimeField(null=True, blank=True)
is_account_locked = models.BooleanField(default=False)
```

### **3. Automatic Security Methods:**
```python
user.increment_failed_login()     # Track failed attempts
user.reset_failed_logins()        # Reset on successful login
user.is_account_currently_locked() # Check lock status
user.send_security_alert()        # Send alert emails
```

---

## 🧪 **Testing the Security System**

### **Test Failed Login Attempts:**
```bash
# Test security alert email
python manage.py test_email --email test@example.com --type security
```

### **Test All Email Types:**
```bash
# Test all email types including security
python manage.py test_email --email test@example.com --type all
```

### **Simulate Failed Logins (in code):**
```python
from django.contrib.auth import get_user_model
User = get_user_model()

# Get a test user
user = User.objects.get(email='test@example.com')

# Simulate failed login attempts
user.increment_failed_login()  # Attempt 1
user.increment_failed_login()  # Attempt 2
user.increment_failed_login()  # Attempt 3 → Security Alert Sent
user.increment_failed_login()  # Attempt 4 → Security Alert Sent
user.increment_failed_login()  # Attempt 5 → Account Locked + Lockout Alert
```

---

## 🔧 **Configuration Options**

### **Customize Security Settings:**
You can modify these values in `users/models.py`:

```python
# In increment_failed_login() method:
if self.failed_login_attempts >= 3:  # Change alert threshold
    self.send_security_alert('failed_login')

if self.failed_login_attempts >= 5:  # Change lockout threshold
    self.is_account_locked = True
    self.account_locked_until = timezone.now() + timedelta(minutes=15)  # Change lockout duration
```

### **Email Alert Settings:**
```python
# In settings.py
EMAIL_RETRY_ATTEMPTS = 3
EMAIL_RETRY_DELAY = 5  # seconds
EMAIL_SUBJECT_PREFIX = '[IERMS] '
```

---

## 📈 **Security Benefits**

1. **🔒 Account Protection**: Automatic lockout after 5 failed attempts
2. **📧 Immediate Alerts**: Email notifications for suspicious activity
3. **⏰ Auto-Recovery**: Accounts unlock automatically after 15 minutes
4. **📊 Audit Trail**: All login attempts are logged for security review
5. **🛡️ IP Tracking**: Failed attempts include IP address and location
6. **🚨 Emergency Support**: 24/7 security contact information in alerts

---

## 🎯 **Summary**

Your IERMS system now has **enterprise-grade login security** with:

- ✅ **5 failed login attempts** before account lockout
- ✅ **15-minute automatic lockout** duration
- ✅ **Security alert emails** after 3 failed attempts
- ✅ **Account lockout emails** after 5 failed attempts
- ✅ **Automatic unlock** after lockout period expires
- ✅ **Complete audit trail** of all login attempts
- ✅ **Professional email templates** with security information

The system is **ready for production** and provides comprehensive protection against brute force attacks while keeping legitimate users informed of any security events.
