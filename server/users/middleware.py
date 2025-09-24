# users/middleware.py
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model

User = get_user_model()


class UserActivityMiddleware(MiddlewareMixin):
    """
    Middleware to track user activity and update last_activity timestamp
    """
    
    def process_request(self, request):
        """
        Update user's last_activity timestamp on every authenticated request
        """
        # Only process authenticated users
        if hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
            
            # Update last_activity and ensure user is marked as online
            # Only update if the user exists and is active
            if user.id and user.is_active:
                # Use update_fields to avoid triggering other signals
                User.objects.filter(id=user.id).update(
                    last_activity=timezone.now(),
                    is_online=True
                )
                
                # Update the user instance in memory to reflect changes
                user.last_activity = timezone.now()
                user.is_online = True
