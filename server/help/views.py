"""
API views for help content management.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse, FileResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from system_config.permissions import IsSystemAdmin
from .utils import (
    get_help_topics,
    get_help_categories,
    save_help_topics,
    save_help_categories,
    export_help_data,
    import_help_data,
    HELP_TOPICS_FILE,
    HELP_CATEGORIES_FILE,
)
import json
import os
import uuid


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_topics(request):
    """Get all help topics."""
    try:
        topics = get_help_topics()
        return Response(topics, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_categories(request):
    """Get all help categories."""
    try:
        categories = get_help_categories()
        return Response(categories, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def save_topics(request):
    """Save help topics (admin only)."""
    try:
        topics = request.data
        
        if not isinstance(topics, list):
            return Response(
                {'error': 'Topics must be a list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        save_help_topics(topics)
        return Response(
            {'success': True, 'message': 'Help topics saved successfully'},
            status=status.HTTP_200_OK
        )
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def save_categories(request):
    """Save help categories (admin only)."""
    try:
        categories = request.data
        
        if not isinstance(categories, list):
            return Response(
                {'error': 'Categories must be a list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        save_help_categories(categories)
        return Response(
            {'success': True, 'message': 'Help categories saved successfully'},
            status=status.HTTP_200_OK
        )
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def export_backup(request):
    """Export help data as JSON (admin only)."""
    try:
        data = export_help_data()
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def restore_backup(request):
    """Import help data from JSON (admin only)."""
    try:
        data = request.data
        
        if not isinstance(data, dict):
            return Response(
                {'error': 'Import data must be a dictionary'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        import_help_data(data)
        return Response(
            {'success': True, 'message': 'Help data restored successfully'},
            status=status.HTTP_200_OK
        )
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def upload_help_image(request):
    """Upload an image for help content (admin only)."""
    try:
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Only images are allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 5MB)
        if file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'File size exceeds 5MB limit'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save file to media/help/images/
        help_images_dir = os.path.join(settings.MEDIA_ROOT, 'help', 'images')
        os.makedirs(help_images_dir, exist_ok=True)
        
        # Generate unique filename
        file_ext = os.path.splitext(file.name)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(help_images_dir, filename)
        
        # Save file
        with default_storage.open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        # Return URL
        image_url = f"{settings.MEDIA_URL}help/images/{filename}"
        
        return Response({
            'success': True,
            'url': image_url,
            'filename': filename
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

