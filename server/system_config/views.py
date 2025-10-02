from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .permissions import IsSystemAdmin
from rest_framework.response import Response
from django.conf import settings
from django.core.mail import send_mail
from django.core.cache import cache
from .models import SystemConfiguration
from .serializers import SystemConfigurationSerializer, SystemConfigurationUpdateSerializer
from .utils import construct_from_email, update_django_settings
from audit.utils import log_activity

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def get_system_configuration(request):
    """Get current system configuration"""
    try:
        config = SystemConfiguration.get_active_config()
        serializer = SystemConfigurationSerializer(config)
        
        # Mask sensitive data for display
        data = serializer.data.copy()
        if data['email_host_password']:
            data['email_host_password'] = '••••••••'  # Mask password
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve configuration: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def update_system_configuration(request):
    """Update system configuration"""
    try:
        config = SystemConfiguration.get_active_config()
        serializer = SystemConfigurationUpdateSerializer(config, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Log the configuration update
            log_activity(
                request.user,
                "update",
                "System configuration updated",
                request=request
            )
            
            updated_config = serializer.save()
            
            # Update Django settings with the new configuration
            update_django_settings()
            
            # Clear cache to ensure new settings take effect
            cache.clear()
            
            # Test email configuration if email settings were updated
            email_fields = ['email_host', 'email_port', 'email_use_tls', 'email_host_user', 'email_host_password', 'default_from_email']
            if any(field in request.data for field in email_fields):
                email_test_result = perform_email_test(updated_config)
                if not email_test_result['success']:
                    return Response({
                        'message': 'Configuration updated but email test failed',
                        'email_test_error': email_test_result['error']
                    }, status=status.HTTP_200_OK)
            
            # Return updated configuration with masked password
            response_serializer = SystemConfigurationSerializer(updated_config)
            data = response_serializer.data.copy()
            if data['email_host_password']:
                data['email_host_password'] = '••••••••'
            
            return Response({
                'message': 'System configuration updated successfully',
                'configuration': data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to update configuration: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def test_email_configuration(request):
    """Test email configuration by sending a test email"""
    try:
        config = SystemConfiguration.get_active_config()
        
        # Get test email from request or use admin email
        test_email = request.data.get('test_email', request.user.email)
        
        result = perform_email_test(config, test_email)
        
        if result['success']:
            return Response({
                'message': 'Email test successful',
                'details': result['message']
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Email test failed',
                'details': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': f'Email test failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def perform_email_test(config, test_email=None):
    """Helper function to test email configuration"""
    try:
        if not config.email_host_user or not config.email_host_password:
            return {
                'success': False,
                'error': 'Email credentials not configured'
            }
        
        if not test_email:
            test_email = config.email_host_user
        
        # Temporarily update Django settings for email test
        original_backend = settings.EMAIL_BACKEND
        original_host = settings.EMAIL_HOST
        original_port = settings.EMAIL_PORT
        original_use_tls = settings.EMAIL_USE_TLS
        original_user = settings.EMAIL_HOST_USER
        original_password = settings.EMAIL_HOST_PASSWORD
        original_from = settings.DEFAULT_FROM_EMAIL
        
        try:
            settings.EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
            settings.EMAIL_HOST = config.email_host
            settings.EMAIL_PORT = config.email_port
            settings.EMAIL_USE_TLS = config.email_use_tls
            settings.EMAIL_HOST_USER = config.email_host_user
            settings.EMAIL_HOST_PASSWORD = config.email_host_password
            constructed_from_email = construct_from_email(config.default_from_email, config.email_host_user)
            settings.DEFAULT_FROM_EMAIL = constructed_from_email
            
            # Debug logging
            print(f"DEBUG: Sending email with from_email: {constructed_from_email}")
            print(f"DEBUG: EMAIL_HOST_USER: {config.email_host_user}")
            print(f"DEBUG: DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
            
            # Note: Gmail will override the from_email if it's not verified in the account
            # This is why you're seeing jerichourbano.01.01.04@gmail.com instead of noreply@gmail.com
            send_mail(
                subject='System Configuration Test Email',
                message='This is a test email to verify your email configuration is working correctly.',
                from_email=constructed_from_email,  # Explicitly use the constructed email
                recipient_list=[test_email],
                fail_silently=False,
            )
            
            return {
                'success': True,
                'message': f'Test email sent successfully to {test_email}'
            }
        
        finally:
            # Restore original settings
            settings.EMAIL_BACKEND = original_backend
            settings.EMAIL_HOST = original_host
            settings.EMAIL_PORT = original_port
            settings.EMAIL_USE_TLS = original_use_tls
            settings.EMAIL_HOST_USER = original_user
            settings.EMAIL_HOST_PASSWORD = original_password
            settings.DEFAULT_FROM_EMAIL = original_from
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def get_current_settings(request):
    """Get current Django settings for comparison"""
    try:
        config = SystemConfiguration.get_active_config()
        
        current_settings = {
            'email_host': getattr(settings, 'EMAIL_HOST', ''),
            'email_port': getattr(settings, 'EMAIL_PORT', 587),
            'email_use_tls': getattr(settings, 'EMAIL_USE_TLS', True),
            'email_host_user': getattr(settings, 'EMAIL_HOST_USER', ''),
            'default_from_email': getattr(settings, 'DEFAULT_FROM_EMAIL', ''),
            'access_token_lifetime': getattr(settings, 'SIMPLE_JWT', {}).get('ACCESS_TOKEN_LIFETIME', ''),
            'refresh_token_lifetime': getattr(settings, 'SIMPLE_JWT', {}).get('REFRESH_TOKEN_LIFETIME', ''),
            # Debug info
            'database_config': {
                'default_from_email': config.default_from_email,
                'email_host_user': config.email_host_user,
                'constructed_from_email': config.get_constructed_from_email(),
            }
        }
        
        return Response(current_settings, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve current settings: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )