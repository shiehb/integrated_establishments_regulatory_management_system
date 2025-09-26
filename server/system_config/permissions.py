from rest_framework.permissions import BasePermission


class IsSystemAdmin(BasePermission):
    """
    Custom permission to allow only Admin role users or Django staff/superusers.
    """

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
            return True
        return getattr(user, 'userlevel', '') == 'Admin'



