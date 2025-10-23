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
    Export completed inspections to PDF
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
        
        # Apply date filters
        print(f"Date filter params - quarter: {quarter}, year: {year}, date_from: {date_from}, date_to: {date_to}")
        
        if date_from and date_to:
            queryset = queryset.filter(updated_at__date__range=[date_from, date_to])
            print(f"After custom date filter ({date_from} to {date_to}): {queryset.count()}")
        elif quarter and year:
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
        else:
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
            # For other user levels, show all completed inspections
            print(f"User level '{request.user.userlevel}' - showing all completed inspections")
        
        inspections = queryset[:100]  # Limit to 100 for PDF
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
        
        # Create PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        story = []
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=15,
            alignment=TA_CENTER,
            textColor=colors.black,
            fontName='Helvetica-Bold'
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=10,
            alignment=TA_CENTER,
            textColor=colors.black,
            fontName='Helvetica-Bold'
        )
        
        # Professional Header Section
        story.append(Paragraph("REPUBLIC OF THE PHILIPPINES", title_style))
        story.append(Paragraph("DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES", subtitle_style))
        story.append(Paragraph("ENVIRONMENTAL MANAGEMENT BUREAU", subtitle_style))
        story.append(Paragraph("REGION I", subtitle_style))
        story.append(Spacer(1, 15))
        
        # Report title
        period_text = f"Q{quarter} {year}" if quarter and year else f"{date_from} to {date_to}"
        story.append(Paragraph("<b>ACCOMPLISHMENT REPORT</b>", subtitle_style))
        story.append(Paragraph(f"Period: {period_text}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Summary Statistics Section - 2x2 Grid Layout
        story.append(Paragraph("<b>SUMMARY STATISTICS</b>", styles['Heading3']))
        
        # Create 2x2 summary grid
        summary_grid_data = [
            ['Total Inspections:', str(total_inspections), 'Compliant:', str(compliant_count)],
            ['Non-Compliant:', str(non_compliant_count), 'Compliance Rate:', f'{compliance_rate:.1f}%']
        ]
        
        summary_grid = Table(summary_grid_data, colWidths=[2*inch, 1*inch, 2*inch, 1*inch])
        summary_grid.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.lightblue),
            ('BACKGROUND', (2, 0), (2, 0), colors.lightgreen),
            ('BACKGROUND', (0, 1), (0, 1), colors.lightcoral),
            ('BACKGROUND', (2, 1), (2, 1), colors.lightyellow),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('PADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(summary_grid)
        story.append(Spacer(1, 20))
        
        # Inspections table
        if inspections:
            story.append(Paragraph("<b>DETAILED INSPECTION LIST</b>", styles['Heading3']))
            
            table_data = [['Code', 'Establishment', 'Law', 'Date', 'Compliance']]
            for inspection in inspections:
                establishment_name = 'N/A'
                if inspection.establishments.exists():
                    establishment_names = [est.name for est in inspection.establishments.all()]
                    establishment_name = ', '.join(establishment_names) if establishment_names else 'N/A'
                
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
            
            # Create professional table with alternating row colors
            table = Table(table_data, colWidths=[1.2*inch, 2.5*inch, 1*inch, 1*inch, 1.3*inch])
            table.setStyle(TableStyle([
                # Header styling
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, 0), 12),
                
                # Data row styling
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
                ('ALIGN', (1, 1), (1, -1), 'LEFT'),  # Left align establishment names
                ('PADDING', (0, 1), (-1, -1), 8),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                
                # Alternating row colors
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                
                # Borders
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                
                # Compliance status color coding
                ('TEXTCOLOR', (4, 1), (4, -1), colors.black),
            ]))
            
            story.append(table)
        
        # Professional Footer Section
        story.append(Spacer(1, 30))
        
        # Footer table with metadata
        from datetime import datetime
        current_time = datetime.now()
        report_id = f"ACCOMP-RPT-{int(current_time.timestamp() * 1000)}"
        
        footer_data = [
            ['Report ID:', report_id, 'Generated on:', current_time.strftime('%Y-%m-%d %H:%M')],
            ['Total Records:', str(total_inspections), 'Prepared by:', request.user.email or 'System'],
        ]
        
        footer_table = Table(footer_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
        footer_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (2, -1), 'LEFT'),
            ('ALIGN', (3, 0), (3, -1), 'LEFT'),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ]))
        
        story.append(footer_table)
        story.append(Spacer(1, 15))
        story.append(Paragraph("*** End of Report ***", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Return PDF response
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        filename = f"accomplishment_report_{period_text.replace(' ', '_')}.pdf"
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
        
        # Get inspections for the period
        if quarter and year:
            from .utils import getQuarterDates
            period_start = getQuarterDates(quarter, year)['start']
            period_end = getQuarterDates(quarter, year)['end']
            inspections = Inspection.objects.filter(
                current_status__in=completed_statuses,
                updated_at__date__range=[period_start, period_end]
            )
        elif date_from and date_to:
            inspections = Inspection.objects.filter(
                current_status__in=completed_statuses,
                updated_at__date__range=[date_from, date_to]
            )
        else:
            inspections = Inspection.objects.filter(current_status__in=completed_statuses)
        
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
