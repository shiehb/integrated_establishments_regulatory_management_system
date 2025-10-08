from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import os
try:
    # Optional import to construct reliable from-email
    from system_config.models import SystemConfiguration
except Exception:
    SystemConfiguration = None

def send_user_welcome_email(user, password):
    """Send welcome email to new user"""
    subject = 'Welcome to Our System'
    
    # Try to get the template path
    template_path = os.path.join(settings.BASE_DIR, 'users', 'templates', 'emails', 'welcome_email.html')
    
    # Check if template exists, fallback to simple text
    if os.path.exists(template_path):
        html_message = render_to_string('emails/welcome_email.html', {
            'user': user,
            'default_password': password,
            'login_url': 'http://localhost:5173/login',
            'logo_url': getattr(settings, 'EMAIL_HEADER_LOGO_URL', None),
            'logo_alt': getattr(settings, 'EMAIL_HEADER_LOGO_ALT', 'IERMS Logo'),
        })
        plain_message = strip_tags(html_message)
    else:
        # Fallback to simple text email if template not found
        plain_message = f"""
        Welcome to Our System!
        
        Hello {user.first_name} {user.last_name},
        
        Your account has been successfully created. Here are your login details:
        
        Email: {user.email}
        Temporary Password: {password}
        User Level: {user.userlevel}
        {f"Section: {user.section}" if user.section else ""}
        
        Important: For security reasons, please change your password after your first login.
        
        You can login to the system here: http://localhost:5173/login
        
        If you have any questions, please contact the system administrator.
        """
        html_message = None
    
    try:
        # Prefer DEFAULT_FROM_EMAIL; fallback to constructed from SystemConfiguration
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
        if not from_email and SystemConfiguration is not None:
            try:
                from_email = SystemConfiguration.get_active_config().get_constructed_from_email()
            except Exception:
                from_email = None

        send_mail(
            subject=subject,
            message=plain_message,
            from_email=from_email,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False