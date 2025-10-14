# 🔒 IERMS Account Lockout Error System

## 🚨 **Account Lockout Error Notifications**

### **Error Response Format:**
When an account is locked, the system returns a detailed error response with specific error codes and helpful information.

---

## 📋 **Error Response Examples**

### **1. 🔒 Account Locked Error (HTTP 423)**
```json
{
  "error": "Account is temporarily locked due to multiple failed login attempts.",
  "error_code": "ACCOUNT_LOCKED",
  "details": {
    "locked_until": "2025-01-15T14:30:00Z",
    "remaining_minutes": 12,
    "failed_attempts": 5
  },
  "message": "Please try again in 12 minutes or contact IT support for immediate assistance."
}
```

### **2. ❌ Invalid Credentials Error (HTTP 401)**
```json
{
  "error": "Invalid email or password.",
  "error_code": "INVALID_CREDENTIALS",
  "message": "Please check your credentials and try again."
}
```

### **3. 🚫 Account Deactivated Error (HTTP 403)**
```json
{
  "error": "Account is deactivated.",
  "error_code": "ACCOUNT_DEACTIVATED",
  "message": "Please contact your administrator to reactivate your account."
}
```

### **4. 📝 Missing Credentials Error (HTTP 400)**
```json
{
  "error": "Email and password are required.",
  "error_code": "MISSING_CREDENTIALS"
}
```

---

## 🔧 **API Endpoint**

### **Login Endpoint:**
```
POST /api/auth/login/
```

### **Request Format:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

### **Success Response (HTTP 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "userlevel": "Inspector",
    "section": "PD-1586",
    "district": "La Union - 1st"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

## 📊 **Error Code Reference**

| Error Code | HTTP Status | Description | User Action |
|------------|-------------|-------------|-------------|
| `ACCOUNT_LOCKED` | 423 | Account locked due to failed attempts | Wait for unlock or contact IT |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password | Check credentials |
| `ACCOUNT_DEACTIVATED` | 403 | Account is disabled | Contact administrator |
| `MISSING_CREDENTIALS` | 400 | Email/password not provided | Provide both fields |
| `LOGIN_ERROR` | 500 | Server error | Try again later |

---

## 🎯 **Frontend Integration Examples**

### **JavaScript/React Example:**
```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Login successful
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // Handle different error types
      switch (data.error_code) {
        case 'ACCOUNT_LOCKED':
          showAccountLockedError(data);
          break;
        case 'INVALID_CREDENTIALS':
          showInvalidCredentialsError();
          break;
        case 'ACCOUNT_DEACTIVATED':
          showAccountDeactivatedError();
          break;
        default:
          showGenericError(data.message);
      }
    }
  } catch (error) {
    showNetworkError();
  }
};

const showAccountLockedError = (data) => {
  const remainingMinutes = data.details.remaining_minutes;
  const message = `
    🔒 Your account is temporarily locked due to multiple failed login attempts.
    
    ⏰ Please try again in ${remainingMinutes} minutes.
    
    🆘 For immediate assistance, contact IT Support:
    📧 Email: support@ierms.denr.gov.ph
    📞 Phone: (02) 8888-4376
  `;
  
  alert(message);
  // Or show in a modal/toast notification
};
```

### **Vue.js Example:**
```vue
<template>
  <div class="login-form">
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required>
      <input v-model="password" type="password" placeholder="Password" required>
      <button type="submit" :disabled="loading">Login</button>
    </form>
    
    <!-- Account Locked Error Display -->
    <div v-if="accountLocked" class="error-message">
      <h3>🔒 Account Temporarily Locked</h3>
      <p>{{ lockoutMessage }}</p>
      <p>⏰ Remaining time: {{ remainingMinutes }} minutes</p>
      <button @click="contactSupport">Contact IT Support</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      accountLocked: false,
      lockoutMessage: '',
      remainingMinutes: 0
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      try {
        const response = await fetch('/api/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Login successful
          this.$router.push('/dashboard');
        } else if (data.error_code === 'ACCOUNT_LOCKED') {
          // Show account locked UI
          this.accountLocked = true;
          this.lockoutMessage = data.message;
          this.remainingMinutes = data.details.remaining_minutes;
        } else {
          // Show other errors
          alert(data.message);
        }
      } catch (error) {
        alert('Network error. Please try again.');
      } finally {
        this.loading = false;
      }
    },
    
    contactSupport() {
      window.open('mailto:support@ierms.denr.gov.ph?subject=Account Lockout Assistance');
    }
  }
}
</script>
```

---

## 🧪 **Testing the System**

### **Test Account Lockout:**
```bash
# Test account lockout with simulation
python manage.py test_account_lockout --email test@example.com --password wrongpassword

# Test specific user
python manage.py test_account_lockout --email admin@ierms.denr.gov.ph --password wrongpass
```

### **Manual API Testing:**
```bash
# Test login with correct credentials
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "correctpassword"}'

# Test login with wrong credentials (repeat 5 times to trigger lockout)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'
```

---

## ⚙️ **Configuration Options**

### **Lockout Settings (in users/models.py):**
```python
# Change lockout threshold (default: 5 attempts)
if self.failed_login_attempts >= 5:  # Change this number

# Change lockout duration (default: 15 minutes)
self.account_locked_until = timezone.now() + timedelta(minutes=15)  # Change minutes

# Change alert threshold (default: 3 attempts)
if self.failed_login_attempts >= 3:  # Change this number
```

### **Error Messages (in users/views.py):**
You can customize all error messages in the `LoginView` class to match your organization's tone and requirements.

---

## 📈 **Security Benefits**

1. **🔒 Account Protection**: Prevents brute force attacks
2. **📧 User Notification**: Clear error messages with actionable information
3. **⏰ Automatic Recovery**: Accounts unlock automatically
4. **📊 Detailed Logging**: All attempts are logged for security review
5. **🛡️ Progressive Security**: Gradual escalation of security measures
6. **🚨 Support Integration**: Built-in support contact information

---

## 🎯 **Summary**

Your IERMS system now provides **comprehensive account lockout error handling** with:

- ✅ **Clear error codes** for different failure scenarios
- ✅ **Detailed error messages** with actionable information
- ✅ **Automatic account locking** after 5 failed attempts
- ✅ **Remaining time calculation** for locked accounts
- ✅ **Support contact information** in error messages
- ✅ **Professional error responses** with proper HTTP status codes
- ✅ **Frontend integration examples** for easy implementation

The system is **production-ready** and provides excellent user experience while maintaining strong security! 🎉
