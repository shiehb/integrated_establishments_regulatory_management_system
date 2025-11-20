from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import io
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from .models import AccomplishmentReport, ReportMetric
from .serializers import (
    AccomplishmentReportSerializer,
    AccomplishmentReportListSerializer,
    ReportCreateSerializer,
    ReportUpdateSerializer,
    ReportMetricSerializer
)
from inspections.models import Inspection

User = get_user_model()


class ReportListCreateView(generics.ListCreateAPIView):
    """
    List all reports or create a new report
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReportCreateSerializer
        return AccomplishmentReportListSerializer
    
    def get_queryset(self):
        queryset = AccomplishmentReport.objects.all()
        
        # Filter by user if not admin
        if not self.request.user.is_staff:
            queryset = queryset.filter(created_by=self.request.user)
        
        # Filter by report type
        report_type = self.request.query_params.get('type', None)
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(period_start__gte=start_date)
        if end_date:
            queryset = queryset.filter(period_end__lte=end_date)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(summary__icontains=search) |
                Q(key_achievements__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a report
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AccomplishmentReportSerializer
    
    def get_queryset(self):
        queryset = AccomplishmentReport.objects.all()
        
        # Filter by user if not admin
        if not self.request.user.is_staff:
            queryset = queryset.filter(created_by=self.request.user)
        
        return queryset


class ReportMetricsView(generics.ListCreateAPIView):
    """
    List or create metrics for a specific report
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReportMetricSerializer
    
    def get_queryset(self):
        report_id = self.kwargs['report_id']
        return ReportMetric.objects.filter(report_id=report_id)
    
    def perform_create(self, serializer):
        report = get_object_or_404(AccomplishmentReport, id=self.kwargs['report_id'])
        serializer.save(report=report)




@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_completed_inspections(request):
    """
    Get completed inspections for the current user
    """
    user = request.user
    
    # Completed inspection statuses
    completed_statuses = [
        'SECTION_COMPLETED_COMPLIANT',
        'SECTION_COMPLETED_NON_COMPLIANT',
        'UNIT_COMPLETED_COMPLIANT',
        'UNIT_COMPLETED_NON_COMPLIANT',
        'MONITORING_COMPLETED_COMPLIANT',
        'MONITORING_COMPLETED_NON_COMPLIANT',
        'CLOSED_COMPLIANT',
        'CLOSED_NON_COMPLIANT'
    ]
    
    # Base queryset
    from inspections.models import Inspection
    queryset = Inspection.objects.filter(
        current_status__in=completed_statuses
    ).select_related('form').prefetch_related('establishments_detail')
    
    # Filter by user level
    if user.userlevel == 'Monitoring Personnel':
        # Monitoring Personnel can only see their own completed inspections
        queryset = queryset.filter(form__inspected_by=user)
    elif user.userlevel in ['Section Chief', 'Unit Head']:
        # Section Chief and Unit Head can see completed inspections in their section
        queryset = queryset.filter(
            Q(form__inspected_by__section=user.section) |
            Q(form__inspected_by__userlevel__in=['Section Chief', 'Unit Head', 'Monitoring Personnel'])
        )
    
    # Apply filters
    quarter = request.query_params.get('quarter')
    year = request.query_params.get('year')
    period_start = request.query_params.get('period_start')
    period_end = request.query_params.get('period_end')
    
    if quarter and year:
        # Filter by quarter
        quarter = int(quarter)
        year = int(year)
        if quarter == 1:
            start_date = f"{year}-01-01"
            end_date = f"{year}-03-31"
        elif quarter == 2:
            start_date = f"{year}-04-01"
            end_date = f"{year}-06-30"
        elif quarter == 3:
            start_date = f"{year}-07-01"
            end_date = f"{year}-09-30"
        else:  # quarter == 4
            start_date = f"{year}-10-01"
            end_date = f"{year}-12-31"
        
        queryset = queryset.filter(
            updated_at__date__range=[start_date, end_date]
        )
    elif period_start and period_end:
        queryset = queryset.filter(
            updated_at__date__range=[period_start, period_end]
        )
    
    # Pagination
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    start = (page - 1) * page_size
    end = start + page_size
    
    total_count = queryset.count()
    inspections = queryset[start:end]
    
    # Serialize the data
    from inspections.serializers import InspectionListSerializer
    serializer = InspectionListSerializer(inspections, many=True)
    
    return Response({
        'results': serializer.data,
        'count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def report_statistics(request):
    """
    Get statistics for reports
    """
    queryset = AccomplishmentReport.objects.all()
    
    # Filter by user if not admin
    if not request.user.is_staff:
        queryset = queryset.filter(created_by=request.user)
    
    stats = {
        'total_reports': queryset.count(),
        'reports_by_type': {},
        'reports_by_quarter': {},
    }
    
    # Reports by type
    for report_type, _ in AccomplishmentReport.REPORT_TYPES:
        stats['reports_by_type'][report_type] = queryset.filter(report_type=report_type).count()
    
    # Reports by quarter
    from django.db.models import Count
    quarterly_reports = queryset.values('quarter', 'year').annotate(
        count=Count('id')
    ).order_by('-year', '-quarter')
    
    for item in quarterly_reports:
        quarter_key = f"Q{item['quarter']} {item['year']}"
        stats['reports_by_quarter'][quarter_key] = item['count']
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_report_pdf(request, report_id):
    """
    Export a specific report to PDF
    """
    try:
        report = get_object_or_404(AccomplishmentReport, id=report_id)
        
        # Check permissions
        if not request.user.is_staff and report.created_by != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Create PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        story = []
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkgreen
        )
        
        # Header
        story.append(Paragraph("REPUBLIC OF THE PHILIPPINES", title_style))
        story.append(Paragraph("DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES", title_style))
        story.append(Paragraph("ENVIRONMENTAL MANAGEMENT BUREAU", title_style))
        story.append(Paragraph("REGION I", title_style))
        story.append(Spacer(1, 20))
        
        # Report title
        story.append(Paragraph(f"<b>{report.title}</b>", styles['Heading2']))
        story.append(Paragraph(f"Quarter: Q{report.quarter} {report.year}", styles['Normal']))
        story.append(Paragraph(f"Period: {report.period_start} to {report.period_end}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Summary
        if report.summary:
            story.append(Paragraph("<b>Summary:</b>", styles['Heading3']))
            story.append(Paragraph(report.summary, styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Key achievements
        if report.key_achievements:
            story.append(Paragraph("<b>Key Achievements:</b>", styles['Heading3']))
            story.append(Paragraph(report.key_achievements, styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Inspections table
        inspections = report.completed_inspections.all()
        if inspections:
            story.append(Paragraph("<b>Completed Inspections:</b>", styles['Heading3']))
            
            # Table data
            table_data = [['Code', 'Establishment', 'Law', 'Date', 'Compliance']]
            for inspection in inspections:
                establishment_name = 'N/A'
                if inspection.establishments_detail:
                    establishment_name = ', '.join([est.get('name', 'N/A') for est in inspection.establishments_detail])
                
                compliance = 'N/A'
                if hasattr(inspection, 'form') and inspection.form:
                    compliance = getattr(inspection.form, 'compliance_decision', 'N/A')
                
                table_data.append([
                    inspection.code or 'N/A',
                    establishment_name,
                    inspection.law or 'N/A',
                    inspection.updated_at.strftime('%Y-%m-%d') if inspection.updated_at else 'N/A',
                    compliance
                ])
            
            # Create table
            table = Table(table_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 20))
        
        # Footer
        story.append(Spacer(1, 30))
        user_name = getattr(report.created_by, 'get_full_name', lambda: None)() or getattr(report.created_by, 'first_name', '') + ' ' + getattr(report.created_by, 'last_name', '') or report.created_by.email
        story.append(Paragraph(f"Prepared by: {user_name}", styles['Normal']))
        story.append(Paragraph(f"Date: {timezone.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Return PDF response
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="report_{report_id}_{report.quarter}_{report.year}.pdf"'
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_inspections_pdf(request):
    """
    Export completed inspections to PDF using professional generator
    """
    try:
        # Get parameters
        quarter = request.query_params.get('quarter')
        year = request.query_params.get('year')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        # Get completed inspections
        completed_statuses = [
            'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
            'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
            'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
            'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
        ]
        
        queryset = Inspection.objects.filter(
            current_status__in=completed_statuses
        ).select_related('form').prefetch_related('establishments')
        
        # Apply date filters - prioritize quarter over custom dates
        print(f"Date filter params - quarter: {quarter}, year: {year}, date_from: {date_from}, date_to: {date_to}")
        
        if quarter and year:
            quarter = int(quarter)
            year = int(year)
            if quarter == 1:
                start_date = f"{year}-01-01"
                end_date = f"{year}-03-31"
            elif quarter == 2:
                start_date = f"{year}-04-01"
                end_date = f"{year}-06-30"
            elif quarter == 3:
                start_date = f"{year}-07-01"
                end_date = f"{year}-09-30"
            else:  # quarter == 4
                start_date = f"{year}-10-01"
                end_date = f"{year}-12-31"
            
            period_text = f"Q{quarter} {year}"
            print(f"Applying quarter filter: {start_date} to {end_date}")
            # Try filtering by updated_at first
            queryset = queryset.filter(updated_at__date__range=[start_date, end_date])
            print(f"After quarter date filter (updated_at): {queryset.count()}")
            
            # If no results, try filtering by created_at as fallback
            if queryset.count() == 0:
                print("No results with updated_at, trying created_at...")
                queryset = Inspection.objects.filter(
                    current_status__in=completed_statuses
                ).select_related('form').prefetch_related('establishments')
                queryset = queryset.filter(created_at__date__range=[start_date, end_date])
                print(f"After quarter date filter (created_at): {queryset.count()}")
        elif date_from and date_to:
            queryset = queryset.filter(updated_at__date__range=[date_from, date_to])
            period_text = f"{date_from} to {date_to}"
            print(f"After custom date filter ({date_from} to {date_to}): {queryset.count()}")
        else:
            period_text = "All Time"
            print("No date filters applied")
        
        # Debug: Print user info and initial queryset count
        print(f"PDF Export Debug - User: {request.user.email}, Userlevel: {request.user.userlevel}")
        print(f"Initial queryset count before user filtering: {queryset.count()}")
        
        # Filter by user level
        if request.user.userlevel == 'Monitoring Personnel':
            queryset = queryset.filter(form__inspected_by=request.user)
            print(f"After Monitoring Personnel filter: {queryset.count()}")
        elif request.user.userlevel in ['Section Chief', 'Unit Head']:
            queryset = queryset.filter(
                Q(form__inspected_by__section=request.user.section) |
                Q(form__inspected_by__userlevel__in=['Section Chief', 'Unit Head', 'Monitoring Personnel'])
            )
            print(f"After Section Chief/Unit Head filter: {queryset.count()}")
        else:
            # For other user levels, show all Enriching inspections
            print(f"User level '{request.user.userlevel}' - showing all completed inspections")
        
        inspections = list(queryset[:100])  # Limit to 100 for PDF
        print(f"Final inspections count: {len(inspections)}")
        
        # If no inspections found with date filter, try without date filter for debugging
        if len(inspections) == 0:
            print("No inspections found with date filter, checking all completed inspections...")
            all_completed = Inspection.objects.filter(current_status__in=completed_statuses).count()
            print(f"Total completed inspections in database: {all_completed}")
            
            # Try without user filtering
            if request.user.userlevel == 'Monitoring Personnel':
                user_inspections = Inspection.objects.filter(
                    current_status__in=completed_statuses,
                    form__inspected_by=request.user
                ).count()
                print(f"User's completed inspections: {user_inspections}")
            
            # TEMPORARY: If still no inspections, get any completed inspections for testing
            if len(inspections) == 0:
                print("Still no inspections found, getting any completed inspections for testing...")
                fallback_queryset = Inspection.objects.filter(
                    current_status__in=completed_statuses
                ).select_related('form').prefetch_related('establishments')[:10]
                inspections = list(fallback_queryset)
                print(f"Fallback inspections count: {len(inspections)}")
        
        # Calculate summary statistics
        total_inspections = len(inspections)
        compliant_count = 0
        non_compliant_count = 0
        
        for inspection in inspections:
            if hasattr(inspection, 'form') and inspection.form:
                compliance = getattr(inspection.form, 'compliance_decision', None)
                if compliance == 'COMPLIANT':
                    compliant_count += 1
                elif compliance == 'NON_COMPLIANT':
                    non_compliant_count += 1
        
        compliance_rate = (compliant_count / total_inspections * 100) if total_inspections > 0 else 0
        
        # Prepare report data for PDF generator
        stats = {
            'total': total_inspections,
            'compliant': compliant_count,
            'non_compliant': non_compliant_count,
            'compliance_rate': compliance_rate
        }
        
        report_data = {
            'quarter': quarter,
            'year': year,
            'date_from': date_from,
            'date_to': date_to,
            'period_text': period_text,
            'inspections': inspections,
            'stats': stats
        }
        
        # Use professional PDF generator
        buffer = io.BytesIO()
        from .pdf_generator import AccomplishmentReportPDFGenerator
        
        generator = AccomplishmentReportPDFGenerator(
            buffer=buffer,
            report_data=report_data,
            user_info=request.user
        )
        generator.generate()
        
        buffer.seek(0)
        
        # Return PDF response
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        filename = f"accomplishment_report_{period_text.replace(' ', '_').replace('/', '_')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
        
    except Exception as e:
        print(f"PDF Export Error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_generated_report(request):
    """
    Save a generated report to database
    """
    try:
        # Get data from request
        title = request.data.get('title')
        quarter = request.data.get('quarter')
        year = request.data.get('year')
        date_from = request.data.get('date_from')
        date_to = request.data.get('date_to')
        pdf_file = request.FILES.get('pdf_file')
        
        # Debug logging
        print(f"Save Report Debug - Title: {title}, Quarter: {quarter}, Year: {year}")
        print(f"PDF File: {pdf_file}, Date from: {date_from}, Date to: {date_to}")
        
        # Determine period
        if quarter and year:
            from .utils import getQuarterDates
            period_start = getQuarterDates(quarter, year)['start']
            period_end = getQuarterDates(quarter, year)['end']
            report_type = 'quarterly'
        else:
            period_start = date_from
            period_end = date_to
            report_type = 'custom'
        
        # Create report record
        report = AccomplishmentReport.objects.create(
            title=title,
            quarter=quarter,
            year=year,
            period_start=period_start,
            period_end=period_end,
            report_type=report_type,
            created_by=request.user,
            status='COMPLETED',
            summary=f"Accomplishment report for {title}",
            key_achievements=f"Generated report covering period from {period_start} to {period_end}"
        )
        
        # Save PDF file if provided
        if pdf_file:
            # Generate filename
            timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
            filename = f'accomplishment_report_{timestamp}.pdf'
            
            # Save file to media/reports/
            file_path = f'reports/{filename}'
            report.pdf_file.save(filename, ContentFile(pdf_file.read()), save=True)
        
        # Create summary metrics using get_or_create to handle OneToOneField properly
        metrics, created = ReportMetric.objects.get_or_create(
            report=report,
            defaults={
                'total_inspections': 0,  # Will be updated with actual data
                'compliant_inspections': 0,
                'non_compliant_inspections': 0,
                'compliance_rate': 0.00,
                'by_law_stats': {},
                'by_district_stats': {}
            }
        )
        
        # Get completed inspections for this period and link them to the report
        completed_statuses = [
            'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
            'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
            'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
            'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
        ]
        
        # Get inspections for the period - prioritize quarter over custom dates
        if quarter and year:
            from .utils import getQuarterDates
            quarter_start, quarter_end = getQuarterDates(quarter, year)['start'], getQuarterDates(quarter, year)['end']
            inspections = Inspection.objects.filter(
                current_status__in=completed_statuses,
                updated_at__date__range=[quarter_start, quarter_end]
            )
            print(f"Quarter filter - Q{quarter} {year}: {quarter_start} to {quarter_end}")
            print(f"Found {inspections.count()} inspections in date range")
            
            # Debug: Check if any inspections exist at all
            all_inspections = Inspection.objects.filter(current_status__in=completed_statuses)
            print(f"Total completed inspections in database: {all_inspections.count()}")
            
            # Debug: Check if any inspections exist for this user
            user_inspections = all_inspections.filter(form__inspected_by=request.user)
            print(f"User's completed inspections: {user_inspections.count()}")
            
            # Debug: Check if any inspections exist in the date range without user filter
            date_range_inspections = Inspection.objects.filter(
                current_status__in=completed_statuses,
                updated_at__date__range=[quarter_start, quarter_end]
            )
            print(f"Inspections in date range (no user filter): {date_range_inspections.count()}")
            
        elif date_from and date_to:
            inspections = Inspection.objects.filter(
                current_status__in=completed_statuses,
                updated_at__date__range=[date_from, date_to]
            )
            print(f"Custom date filter: {date_from} to {date_to}")
        else:
            inspections = Inspection.objects.filter(current_status__in=completed_statuses)
            print("No date filter applied")
        
        # Filter by user level
        if request.user.userlevel == 'Monitoring Personnel':
            inspections = inspections.filter(form__inspected_by=request.user)
        elif request.user.userlevel in ['Section Chief', 'Unit Head']:
            inspections = inspections.filter(
                Q(form__inspected_by__section=request.user.section) |
                Q(form__inspected_by__userlevel__in=['Section Chief', 'Unit Head', 'Monitoring Personnel'])
            )
        
        # Link inspections to the report
        report.completed_inspections.set(inspections)
        
        # Update metrics with actual data
        total_inspections = inspections.count()
        compliant_count = inspections.filter(form__compliance_decision='COMPLIANT').count()
        non_compliant_count = inspections.filter(form__compliance_decision='NON_COMPLIANT').count()
        compliance_rate = (compliant_count / total_inspections * 100) if total_inspections > 0 else 0
        
        # Update the metrics
        metrics.total_inspections = total_inspections
        metrics.compliant_inspections = compliant_count
        metrics.non_compliant_inspections = non_compliant_count
        metrics.compliance_rate = compliance_rate
        metrics.save()
        
        serializer = AccomplishmentReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Save Report Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===============================================
# Centralized Report Dashboard Endpoints
# ===============================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_report_access(request):
    """
    Get list of allowed report types for the current user based on their role
    """
    from .models import ReportAccess
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        user = request.user
        user_role = user.userlevel
        
        # Log user information
        logger.info(f"[REPORT ACCESS] User: {user.email} (ID: {user.id})")
        logger.info(f"[REPORT ACCESS] User Role: '{user_role}' (type: {type(user_role).__name__})")
        
        # Check if ReportAccess table has any data
        total_access_count = ReportAccess.objects.count()
        logger.info(f"[REPORT ACCESS] Total entries in ReportAccess table: {total_access_count}")
        
        if total_access_count == 0:
            logger.error("[REPORT ACCESS] ❌ ReportAccess table is EMPTY! Need to run seed_report_access command or SQL")
            return Response({
                'role': user_role,
                'allowed_reports': [],
                'debug_info': {
                    'error': 'ReportAccess table is empty',
                    'solution': 'Run: python manage.py seed_report_access OR execute seed_report_access.sql'
                }
            }, status=status.HTTP_200_OK)
        
        # Check what roles exist in the table
        existing_roles = list(ReportAccess.objects.values_list('role', flat=True).distinct())
        logger.info(f"[REPORT ACCESS] Roles found in ReportAccess table: {existing_roles}")
        
        # Query ReportAccess table for this user's role
        allowed_reports = ReportAccess.objects.filter(role=user_role).values(
            'report_type', 'display_name'
        ).order_by('display_name')
        
        report_count = allowed_reports.count()
        logger.info(f"[REPORT ACCESS] Found {report_count} reports for role '{user_role}'")
        
        if report_count == 0:
            logger.warning(f"[REPORT ACCESS] ⚠️ No reports found for role '{user_role}'")
            logger.warning(f"[REPORT ACCESS] User role might not match database. Check spelling and case sensitivity.")
            logger.warning(f"[REPORT ACCESS] Expected one of: {existing_roles}")
            
            return Response({
                'role': user_role,
                'allowed_reports': [],
                'debug_info': {
                    'error': f'No reports configured for role: {user_role}',
                    'user_role': user_role,
                    'available_roles': existing_roles,
                    'suggestion': 'Check if user role matches exactly with database entries (case-sensitive)'
                }
            }, status=status.HTTP_200_OK)
        
        # Log each report found
        for report in allowed_reports:
            logger.info(f"[REPORT ACCESS]   ✓ {report['display_name']} ({report['report_type']})")
        
        logger.info(f"[REPORT ACCESS] ✅ Successfully returned {report_count} reports for {user.email}")
        
        return Response({
            'role': user_role,
            'allowed_reports': list(allowed_reports)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        logger.error(f"[REPORT ACCESS] ❌ Exception occurred: {str(e)}")
        logger.error(f"[REPORT ACCESS] Traceback: {traceback.format_exc()}")
        
        return Response({
            'error': str(e),
            'detail': 'Failed to retrieve report access',
            'debug_info': {
                'exception_type': type(e).__name__,
                'exception_message': str(e)
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_report(request):
    """
    Generate a report based on report type and filters
    
    Request Body:
    {
        "report_type": "inspection",
        "time_filter": "quarterly",
        "quarter": 1,
        "year": 2025,
        "date_from": "2025-01-01",  // optional, for custom range
        "date_to": "2025-03-31",    // optional, for custom range
        "extra_filters": {
            "inspector_id": 12,
            "law": "PD-1586"
        }
    }
    """
    from .models import ReportAccess
    from .generators import get_generator
    from .utils import get_quarter_dates
    
    try:
        # Validate request data
        report_type = request.data.get('report_type')
        if not report_type:
            return Response({
                'error': 'report_type is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has access to this report type
        import logging
        logger = logging.getLogger(__name__)
        
        user = request.user
        user_role = user.userlevel
        
        logger.info(f"[GENERATE REPORT] User: {user.email} attempting to generate '{report_type}' report")
        logger.info(f"[GENERATE REPORT] User Role: '{user_role}'")
        
        has_access = ReportAccess.objects.filter(
            role=user_role, 
            report_type=report_type
        ).exists()
        
        if not has_access:
            # Log why access was denied
            user_reports = list(ReportAccess.objects.filter(role=user_role).values_list('report_type', flat=True))
            logger.warning(f"[GENERATE REPORT] ❌ Access DENIED for {user.email}")
            logger.warning(f"[GENERATE REPORT] Requested: '{report_type}' | User's allowed reports: {user_reports}")
            
            return Response({
                'error': 'You do not have permission to access this report type',
                'detail': f'Report type "{report_type}" not allowed for role "{user_role}"',
                'debug_info': {
                    'requested_report': report_type,
                    'user_role': user_role,
                    'allowed_reports': user_reports
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        logger.info(f"[GENERATE REPORT] ✅ Access granted for {user.email} to generate '{report_type}'")
        
        # Parse time filters
        time_filter = request.data.get('time_filter', 'custom')
        date_from = request.data.get('date_from')
        date_to = request.data.get('date_to')
        
        # Handle quarterly filter
        if time_filter == 'quarterly':
            quarter = request.data.get('quarter')
            year = request.data.get('year')
            
            if not quarter or not year:
                return Response({
                    'error': 'quarter and year are required for quarterly reports'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate date range from quarter
            try:
                quarter_dates = get_quarter_dates(int(quarter), int(year))
                date_from = quarter_dates['start']
                date_to = quarter_dates['end']
            except (ValueError, KeyError) as e:
                return Response({
                    'error': f'Invalid quarter or year: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle monthly filter
        elif time_filter == 'monthly':
            month = request.data.get('month')
            year = request.data.get('year')
            
            if not month or not year:
                return Response({
                    'error': 'month and year are required for monthly reports'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate date range from month
            from datetime import date
            from calendar import monthrange
            
            try:
                month_int = int(month)
                year_int = int(year)
                date_from = date(year_int, month_int, 1)
                last_day = monthrange(year_int, month_int)[1]
                date_to = date(year_int, month_int, last_day)
            except (ValueError, TypeError) as e:
                return Response({
                    'error': f'Invalid month or year: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate date range for custom filter
        elif time_filter == 'custom':
            if not date_from or not date_to:
                return Response({
                    'error': 'date_from and date_to are required for custom date range'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get extra filters
        extra_filters = request.data.get('extra_filters', {})
        
        # Prepare filters dict
        filters = {
            'time_filter': time_filter,
            'date_from': date_from,
            'date_to': date_to,
            'quarter': request.data.get('quarter'),
            'year': request.data.get('year'),
            'month': request.data.get('month'),
            'extra_filters': extra_filters
        }
        
        # Get the appropriate report generator
        try:
            generator = get_generator(report_type)
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate the report
        try:
            report_data = generator.generate(filters, request.user)
            return Response(report_data, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Failed to generate report',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'An unexpected error occurred',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_filter_options(request):
    """
    Get available filter options for a specific report type
    
    Query Parameters:
    - report_type: The type of report to get filter options for
    """
    from establishments.models import Establishment
    from laws.models import Law
    
    try:
        report_type = request.query_params.get('report_type')
        
        if not report_type:
            return Response({
                'error': 'report_type query parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        filter_options = {}
        
        # Common filters
        years = list(range(2020, timezone.now().year + 2))
        filter_options['years'] = years
        filter_options['quarters'] = [
            {'value': 1, 'label': 'Q1 (Jan-Mar)'},
            {'value': 2, 'label': 'Q2 (Apr-Jun)'},
            {'value': 3, 'label': 'Q3 (Jul-Sep)'},
            {'value': 4, 'label': 'Q4 (Oct-Dec)'}
        ]
        filter_options['months'] = [
            {'value': 1, 'label': 'January'},
            {'value': 2, 'label': 'February'},
            {'value': 3, 'label': 'March'},
            {'value': 4, 'label': 'April'},
            {'value': 5, 'label': 'May'},
            {'value': 6, 'label': 'June'},
            {'value': 7, 'label': 'July'},
            {'value': 8, 'label': 'August'},
            {'value': 9, 'label': 'September'},
            {'value': 10, 'label': 'October'},
            {'value': 11, 'label': 'November'},
            {'value': 12, 'label': 'December'}
        ]
        
        # Report-specific filters
        if report_type == 'establishment':
            # Get unique provinces, cities, barangays
            provinces = Establishment.objects.values_list('province', flat=True).distinct().order_by('province')
            filter_options['provinces'] = [{'value': p, 'label': p} for p in provinces if p]
            filter_options['status_options'] = [
                {'value': 'active', 'label': 'Active'},
                {'value': 'inactive', 'label': 'Inactive'},
                {'value': 'ALL', 'label': 'All'}
            ]
        
        elif report_type == 'user':
            # Get user roles
            from django.contrib.auth import get_user_model
            User = get_user_model()
            roles = User.USERLEVEL_CHOICES
            filter_options['roles'] = [{'value': r[0], 'label': r[1]} for r in roles]
            
            # Get sections
            sections = User.SECTION_CHOICES
            filter_options['sections'] = [{'value': s[0], 'label': s[1]} for s in sections]
            
            filter_options['status_options'] = [
                {'value': 'active', 'label': 'Active'},
                {'value': 'inactive', 'label': 'Inactive'},
                {'value': 'ALL', 'label': 'All'}
            ]
        
        elif report_type == 'law':
            # Get law categories
            categories = Law.objects.values_list('category', flat=True).distinct()
            filter_options['categories'] = [{'value': c, 'label': c} for c in categories if c]
            filter_options['status_options'] = [
                {'value': 'Active', 'label': 'Active'},
                {'value': 'Inactive', 'label': 'Inactive'},
                {'value': 'ALL', 'label': 'All'}
            ]
        
        elif report_type in ['inspection', 'compliance', 'non_compliant', 'section_accomplishment', 'unit_accomplishment', 'monitoring_accomplishment']:
            # Get available laws
            laws = Law.objects.filter(status='Active').values('reference_code', 'law_title')
            filter_options['laws'] = [
                {'value': law['reference_code'], 'label': f"{law['reference_code']} - {law['law_title']}"} 
                for law in laws
            ]
            
            # Compliance filter for accomplishment reports
            if report_type in ['section_accomplishment', 'unit_accomplishment', 'monitoring_accomplishment']:
                filter_options['compliance_options'] = [
                    {'value': 'ALL', 'label': 'All'},
                    {'value': 'compliant', 'label': 'Compliant'},
                    {'value': 'non_compliant', 'label': 'Non-Compliant'},
                ]
            
            # Get inspectors (users who can be assigned) - only for inspection report
            if report_type == 'inspection':
                from django.contrib.auth import get_user_model
                User = get_user_model()
                inspectors = User.objects.filter(
                    is_active=True
                ).exclude(userlevel='Admin').values('id', 'first_name', 'last_name', 'email')
                filter_options['inspectors'] = [
                    {
                        'value': insp['id'], 
                        'label': f"{insp['first_name']} {insp['last_name']}" if insp['first_name'] else insp['email']
                    } 
                    for insp in inspectors
                ]
        
        elif report_type == 'billing':
            filter_options['status_options'] = [
                {'value': 'UNPAID', 'label': 'Unpaid'},
                {'value': 'PAID', 'label': 'Paid'},
                {'value': 'ALL', 'label': 'All'}
            ]
        
        elif report_type == 'quota':
            # Get available laws from quota records
            from inspections.models import ComplianceQuota
            laws = ComplianceQuota.objects.values_list('law', flat=True).distinct()
            filter_options['laws'] = [{'value': law, 'label': law} for law in laws if law]
        
        elif report_type in ['nov', 'noo']:
            # Get available laws
            laws = Law.objects.filter(status='Active').values('reference_code', 'law_title')
            filter_options['laws'] = [
                {'value': law['reference_code'], 'label': f"{law['reference_code']} - {law['law_title']}"} 
                for law in laws
            ]
            
            # Get establishments
            establishments = Establishment.objects.filter(is_active=True).values('id', 'name')
            filter_options['establishments'] = [
                {'value': est['id'], 'label': est['name']} 
                for est in establishments
            ]
            
            # Get users who can send NOV/NOO
            from django.contrib.auth import get_user_model
            User = get_user_model()
            senders = User.objects.filter(is_active=True).values('id', 'first_name', 'last_name', 'email')
            filter_options['senders'] = [
                {
                    'value': sender['id'], 
                    'label': f"{sender['first_name']} {sender['last_name']}" if sender['first_name'] else sender['email']
                } 
                for sender in senders
            ]
            
            # Status options
            filter_options['status_options'] = [
                {'value': 'ALL', 'label': 'All'},
                {'value': 'PENDING', 'label': 'Pending'},
                {'value': 'OVERDUE', 'label': 'Overdue'},
            ]
        
        return Response(filter_options, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Failed to retrieve filter options',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)