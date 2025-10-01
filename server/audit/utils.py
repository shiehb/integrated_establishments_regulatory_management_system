from .models import ActivityLog

def log_activity(user, action, message="", request=None):
    """
    Create an activity log entry.
    """
    ip = None
    ua = ""

    if request:
        ip = get_client_ip(request)
        ua = request.META.get("HTTP_USER_AGENT", "") or ""

    # ✅ Handle both authenticated users and system-created logs
    user_to_log = None
    if user and hasattr(user, 'is_authenticated'):
        if user.is_authenticated:
            user_to_log = user
    elif user:  # e.g., system-created user from signals
        user_to_log = user

    ActivityLog.objects.create(
        user=user_to_log,
        action=action,
        message=message,
        ip_address=ip,
        user_agent=ua or ""  # ✅ force string, never None
    )


def get_client_ip(request):
    """
    Extract client IP address from request headers.
    Works with proxy setups using X-Forwarded-For.
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
