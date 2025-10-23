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
        story.append(Paragraph(f"Prepared by: {report.created_by.get_full_name() or report.created_by.username}", styles['Normal']))
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
        ).select_related('form').prefetch_related('establishments_detail')
        
        # Apply date filters
        if date_from and date_to:
            queryset = queryset.filter(updated_at__date__range=[date_from, date_to])
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
            
            queryset = queryset.filter(updated_at__date__range=[start_date, end_date])
        
        # Filter by user level
        if request.user.userlevel == 'Monitoring Personnel':
            queryset = queryset.filter(form__inspected_by=request.user)
        elif request.user.userlevel in ['Section Chief', 'Unit Head']:
            queryset = queryset.filter(
                Q(form__inspected_by__section=request.user.section) |
                Q(form__inspected_by__userlevel__in=['Section Chief', 'Unit Head', 'Monitoring Personnel'])
            )
        
        inspections = queryset[:100]  # Limit to 100 for PDF
        
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
        period_text = f"Q{quarter} {year}" if quarter and year else f"{date_from} to {date_to}"
        story.append(Paragraph(f"<b>Completed Inspections Report</b>", styles['Heading2']))
        story.append(Paragraph(f"Period: {period_text}", styles['Normal']))
        story.append(Paragraph(f"Total Inspections: {len(inspections)}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Inspections table
        if inspections:
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
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
        
        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph(f"Prepared by: {request.user.get_full_name() or request.user.username}", styles['Normal']))
        story.append(Paragraph(f"Date: {timezone.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Return PDF response
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        filename = f"inspections_{period_text.replace(' ', '_')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
