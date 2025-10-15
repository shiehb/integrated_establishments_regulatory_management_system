<!-- f93dfc5b-4fc1-426f-b951-64bc298c3738 ea76655a-314a-47b9-8a7b-78e881890568 -->
# Force Password Change on First Login

## Overview

Implement forced password change for all newly created users on their first login. Users will be blocked from accessing the system until they change their auto-generated password.

## Backend Changes

### 1. Update User Model Defaults

File: `server/users/models.py`

- In `UserManager.create_user()` (line 8): Set `must_change_password = True` by default for new users
- In `UserManager.create_superuser()` (line 30): Keep `must_change_password = False` for superusers

### 2. Update User Serializers

File: `server/users/serializers.py`

- In `UserSerializer` (line 126): Add `must_change_password` and `is_first_login` to the fields tuple (line 129-141)
- This ensures the login response includes these flags

### 3. Update Login View

File: `server/users/views.py`

- In `LoginView.post()` (line 38): After successful authentication (around line 86), check if `user.must_change_password` is True
- Return the `must_change_password` flag in the login response data (around line 90-98)
- The frontend already checks for `response.must_change_password` and redirects to `/force-change-password`

## Frontend (Already Implemented)

- Login page checks `result.mustChangePassword` and redirects to `/force-change-password` (line 79 in Login.jsx)
- ForceChangePassword page is fully implemented with validation
- API service extracts `must_change_password` from login response (line 83 in api.js)

## Testing Steps

1. Create a new user account (will have `must_change_password = True`)
2. Login with the auto-generated password
3. Should be redirected to force change password page
4. Change password successfully
5. After password change, `must_change_password` and `is_first_login` should be set to False
6. User can now access the system normally

### To-dos

- [ ] Update UserManager.create_user() to set must_change_password=True by default
- [ ] Add must_change_password and is_first_login to UserSerializer fields
- [ ] Ensure LoginView returns must_change_password flag in response
- [ ] Test complete flow: create user, login, force change password