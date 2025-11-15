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
    """Export help data as ZIP archive with images (admin only)."""
    try:
        # Check if client wants JSON only (for backward compatibility)
        format_type = request.GET.get('format', 'zip')
        
        if format_type == 'json':
            # Return JSON only (backward compatibility)
            data = export_help_data(include_images=False)
            return Response(data, status=status.HTTP_200_OK)
        else:
            # Return ZIP with images
            zip_bytes, zip_filename = export_help_data(include_images=True)
            
            from django.http import HttpResponse
            response = HttpResponse(zip_bytes, content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename="{zip_filename}"'
            return response
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def restore_backup(request):
    """Import help data from JSON or ZIP archive (admin only)."""
    try:
        import tempfile
        
        # Check if ZIP file was uploaded
        if 'file' in request.FILES:
            zip_file = request.FILES['file']
            
            # Validate file type
            if not zip_file.name.endswith('.zip'):
                return Response(
                    {'error': 'Invalid file type. Please upload a ZIP file.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save uploaded file temporarily
            temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
            for chunk in zip_file.chunks():
                temp_zip.write(chunk)
            temp_zip.close()
            
            try:
                # Import from ZIP
                result = import_help_data(None, zip_file_path=temp_zip.name)
                return Response(
                    {
                        'success': True,
                        'message': 'Help data restored successfully',
                        'topics_imported': result['topics_imported'],
                        'categories_imported': result['categories_imported'],
                        'images_imported': result['images_imported']
                    },
                    status=status.HTTP_200_OK
                )
            finally:
                # Clean up temporary file
                if os.path.exists(temp_zip.name):
                    os.remove(temp_zip.name)
        else:
            # Import from JSON (backward compatibility)
            data = request.data
            
            if not isinstance(data, dict):
                return Response(
                    {'error': 'Import data must be a dictionary or ZIP file'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            result = import_help_data(data)
            return Response(
                {
                    'success': True,
                    'message': 'Help data restored successfully',
                    'topics_imported': result['topics_imported'],
                    'categories_imported': result['categories_imported'],
                    'images_imported': result['images_imported']
                },
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

