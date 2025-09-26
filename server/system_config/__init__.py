from rest_framework.permissions import BasePermission


class IsSystemAdmin(BasePermission):
    """Allow only users with Admin userlevel (or Django is_staff/superuser)."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Accept Django staff/superuser
        if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
            return True
        # Accept custom userlevel Admin
        return getattr(user, 'userlevel', '') == 'Admin'



