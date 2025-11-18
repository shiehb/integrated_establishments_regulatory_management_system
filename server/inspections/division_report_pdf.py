"""
Division Report PDF Generator using reportlab
Generates professional PDF reports with government formatting
"""
import os
import io
from datetime import datetime
from django.conf import settings
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY


class DivisionReportPDFGenerator:
    """
    Professional PDF generator for division reports
    """
    
    def __init__(self, buffer, report_data, filters_applied, user_info):
        self.buffer = buffer
        self.report_data = report_data
        self.filters_applied = filters_applied
        self.user_info = user_info
        self.doc = None
        self.styles = None
        self.story = []
        
        # Logo paths
        self.LOGO1_PATH = os.path.join(settings.BASE_DIR, '../public/assets/document/logo1.png')
        self.LOGO2_PATH = os.path.join(settings.BASE_DIR, '../public/assets/document/logo2.png')
        
    def _setup_styles(self):
        """Setup professional text styles with government color scheme"""
        self.styles = getSampleStyleSheet()
        
        # Government colors
        self.gov_blue = colors.Color(0.0, 0.4, 0.7)  # Dark blue
        self.gov_green = colors.Color(0.0, 0.5, 0.3)  # Dark green
        self.light_blue = colors.Color(0.9, 0.95, 1.0)
        self.light_green = colors.Color(0.9, 1.0, 0.95)
        self.light_red = colors.Color(1.0, 0.9, 0.9)
        
        # Title style
        self.styles.add(ParagraphStyle(
            name='GovernmentTitle',
            parent=self.styles['Title'],
            fontSize=16,
            textColor=self.gov_blue,
            alignment=TA_CENTER,
            spaceAfter=12
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='GovernmentSubtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=self.gov_green,
            alignment=TA_CENTER,
            spaceAfter=10
        ))
        
    def _add_header(self):
        """Add header with logos and agency information"""
        # Try to load logos
        logo1 = None
        logo2 = None
        
        if os.path.exists(self.LOGO1_PATH):
            try:
                logo1 = Image(self.LOGO1_PATH, width=1.5*inch, height=1.5*inch)
            except:
                pass
        
        if os.path.exists(self.LOGO2_PATH):
            try:
                logo2 = Image(self.LOGO2_PATH, width=1.5*inch, height=1.5*inch)
            except:
                pass
        
        # Header table
        header_data = [
            [logo1, 'ENVIRONMENTAL MANAGEMENT BUREAU', logo2],
            ['', 'REGION IV-A CALABARZON', ''],
        ]
        
        header_table = Table(header_data, colWidths=[1.5*inch, 4*inch, 1.5*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (1, 0), (1, 0), 'Times-Bold'),
            ('FONTSIZE', (1, 0), (1, 0), 14),
            ('FONTNAME', (1, 1), (1, 1), 'Times-Roman'),
            ('FONTSIZE', (1, 1), (1, 1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        self.story.append(header_table)
        self.story.append(Spacer(1, 0.2*inch))
    
    def _add_title_page(self):
        """Add professional title page"""
        # Report title
        title_text = "<para align='center'><b><font size='18' color='#0066CC'>DIVISION REPORT</font></b></para>"
        self.story.append(Paragraph(title_text, self.styles['GovernmentTitle']))
        
        subtitle_text = "<para align='center'><font size='14' color='#008000'>Inspection Summary Report</font></para>"
        self.story.append(Paragraph(subtitle_text, self.styles['GovernmentSubtitle']))
        
        self.story.append(Spacer(1, 0.2*inch))
        
        # Generation info
        gen_date = datetime.now().strftime("%B %d, %Y")
        date_text = f"<para align='center'><font size='10'>Generated on: {gen_date}</font></para>"
        self.story.append(Paragraph(date_text, self.styles['Normal']))
        
        self.story.append(Spacer(1, 0.3*inch))
        
        # Report metadata
        metadata_data = [
            ['Report ID:', f"DIV-RPT-{int(datetime.now().timestamp() * 1000)}"],
            ['Prepared by:', f"{self.user_info.first_name} {self.user_info.last_name}"],
            ['User Level:', self.user_info.userlevel],
            ['Email:', self.user_info.email],
            ['Generated:', datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
        metadata_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Times-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Times-Roman'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (0, -1), self.light_blue),
        ]))
        
        self.story.append(metadata_table)
        self.story.append(Spacer(1, 0.3*inch))
        
        # Filters applied
        if self.filters_applied:
            filter_data = [['FILTERS APPLIED:', '']]
            for key, value in self.filters_applied.items():
                filter_data.append([key.replace('_', ' ').title() + ':', str(value)])
            
            filter_table = Table(filter_data, colWidths=[2*inch, 4*inch])
            filter_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, 0), 'Times-Bold'),
                ('FONTSIZE', (0, 0), (0, 0), 11),
                ('BACKGROUND', (0, 0), (-1, 0), self.light_blue),
                ('FONTNAME', (0, 1), (0, -1), 'Times-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Times-Roman'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            self.story.append(filter_table)
            self.story.append(Spacer(1, 0.3*inch))
    
    def _add_statistics_section(self):
        """Add statistics summary section"""
        stats = self.report_data.get('statistics', {})
        inspection_stats = stats.get('inspection_summary', {})
        compliance_stats = stats.get('compliance_summary', {})
        
        stats_title = Paragraph("<b>SUMMARY STATISTICS</b>", self.styles['Heading2'])
        self.story.append(stats_title)
        self.story.append(Spacer(1, 0.2*inch))
        
        # Inspection summary
        stats_data = [
            ['Metric', 'Value'],
            ['Total Inspections', str(inspection_stats.get('total_inspections', 0))],
            ['Division Reviewed', str(inspection_stats.get('division_reviewed', 0))],
            ['Section Completed', str(inspection_stats.get('section_completed', 0))],
            ['Total NOV Issued', str(inspection_stats.get('total_nov', 0))],
            ['Total NOO Issued', str(inspection_stats.get('total_noo', 0))],
            ['Compliant', str(compliance_stats.get('compliant_count', 0))],
            ['Non-Compliant', str(compliance_stats.get('non_compliant_count', 0))],
            ['Pending', str(compliance_stats.get('pending_count', 0))],
        ]
        
        stats_table = Table(stats_data, colWidths=[3*inch, 3*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.gov_blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTNAME', (0, 1), (-1, -1), 'Times-Roman'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [self.light_blue, colors.white]),
        ]))
        
        self.story.append(stats_table)
        self.story.append(PageBreak())
    
    def _add_data_table(self):
        """Add main data table"""
        records = self.report_data.get('records', [])
        
        if not records:
            no_data = Paragraph("<b>No inspection records found for the selected filters.</b>", self.styles['Normal'])
            self.story.append(no_data)
            return
        
        data_title = Paragraph("<b>DETAILED INSPECTION DATA</b>", self.styles['Heading2'])
        self.story.append(data_title)
        self.story.append(Spacer(1, 0.2*inch))
        
        # Table headers
        headers = [
            'Inspection No.', 'Establishment', 'Law', 'Inspection Date',
            'Status', 'NOV', 'NOO', 'Compliance', 'Inspected By'
        ]
        
        # Prepare data rows
        data_rows = [headers]
        for record in records:
            has_nov = record.get('has_nov', False)
            has_noo = record.get('has_noo', False)
            status = record.get('simplified_status', record.get('current_status', 'N/A'))
            if 'CLOSED' in status or 'SECTION_COMPLETED' in status:
                status = 'Completed'
            
            row = [
                record.get('code', 'N/A'),
                record.get('establishment_name', 'N/A')[:30],  # Truncate long names
                record.get('law', 'N/A'),
                record.get('created_at', 'N/A')[:10] if record.get('created_at') else 'N/A',
                status,
                '✓' if has_nov else '✗',
                '✓' if has_noo else '✗',
                record.get('compliance_status', 'PENDING'),
                record.get('inspected_by_name', 'Not Inspected') or 'Not Inspected',
            ]
            data_rows.append(row)
        
        # Create table
        col_widths = [1*inch, 2*inch, 1*inch, 0.8*inch, 1*inch, 0.5*inch, 0.5*inch, 0.8*inch, 1.2*inch]
        data_table = Table(data_rows, colWidths=col_widths, repeatRows=1)
        
        # Style the table
        table_style = [
            ('BACKGROUND', (0, 0), (-1, 0), self.gov_blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTNAME', (0, 1), (-1, -1), 'Times-Roman'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [self.light_blue, colors.white]),
        ]
        
        data_table.setStyle(TableStyle(table_style))
        self.story.append(data_table)
    
    def _add_recommendations(self):
        """Add recommendations section"""
        recommendations = self.report_data.get('recommendations', [])
        
        if not recommendations:
            return
        
        self.story.append(PageBreak())
        rec_title = Paragraph("<b>SYSTEM RECOMMENDATIONS</b>", self.styles['Heading2'])
        self.story.append(rec_title)
        self.story.append(Spacer(1, 0.2*inch))
        
        for idx, rec in enumerate(recommendations, start=1):
            rec_type = Paragraph(f"<b>{idx}. {rec.get('type', 'Recommendation')}</b>", self.styles['Normal'])
            self.story.append(rec_type)
            
            rec_desc = Paragraph(rec.get('description', ''), self.styles['Normal'])
            self.story.append(rec_desc)
            self.story.append(Spacer(1, 0.15*inch))
    
    def generate(self):
        """Generate the complete PDF document"""
        try:
            # Setup styles first
            self._setup_styles()
            
            # Create document
            self.doc = SimpleDocTemplate(
                self.buffer,
                pagesize=A4,
                rightMargin=0.5*inch,
                leftMargin=0.5*inch,
                topMargin=0.5*inch,
                bottomMargin=0.5*inch
            )
            
            # Build story
            self._add_header()
            self._add_title_page()
            self._add_statistics_section()
            self._add_data_table()
            self._add_recommendations()
            
            # Build PDF
            self.doc.build(self.story)
            
        except Exception as e:
            print(f"PDF Generation Error: {str(e)}")
            raise e
        
        return self.buffer

