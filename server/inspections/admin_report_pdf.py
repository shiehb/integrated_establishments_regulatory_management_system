"""
Admin Report PDF Generator using reportlab
Generates professional PDF reports for establishments and users
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


class AdminReportPDFGenerator:
    """
    Professional PDF generator for admin reports (establishments and users)
    """
    
    def __init__(self, buffer, report_data, filters_applied, user_info):
        self.buffer = buffer
        self.report_data = report_data
        self.filters_applied = filters_applied
        self.user_info = user_info if isinstance(user_info, dict) else {
            'name': getattr(user_info, 'get_full_name', lambda: '')() or getattr(user_info, 'email', ''),
            'userlevel': getattr(user_info, 'userlevel', 'Admin')
        }
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
    
    def _add_title_page(self, report_type):
        """Add professional title page"""
        title_map = {
            'establishments': 'ADMIN REPORT - ESTABLISHMENTS',
            'users': 'ADMIN REPORT - USERS'
        }
        subtitle_map = {
            'establishments': 'Generation of Added Establishments',
            'users': 'Generation of Added Users'
        }
        
        # Report title
        title_text = f"<para align='center'><b><font size='18' color='#0066CC'>{title_map.get(report_type, 'ADMIN REPORT')}</font></b></para>"
        self.story.append(Paragraph(title_text, self.styles['GovernmentTitle']))
        
        subtitle_text = f"<para align='center'><font size='14' color='#008000'>{subtitle_map.get(report_type, 'Admin Report')}</font></para>"
        self.story.append(Paragraph(subtitle_text, self.styles['GovernmentSubtitle']))
        
        self.story.append(Spacer(1, 0.2*inch))
        
        # Generation info
        gen_date = datetime.now().strftime("%B %d, %Y")
        date_text = f"<para align='center'><font size='10'>Generated on: {gen_date}</font></para>"
        self.story.append(Paragraph(date_text, self.styles['Normal']))
        
        self.story.append(Spacer(1, 0.3*inch))
        
        # Report metadata
        metadata_data = [
            ['Report ID:', f"ADM-{report_type.upper()}-{int(datetime.now().timestamp() * 1000)}"],
            ['Prepared by:', self.user_info.get('name', 'N/A')],
            ['User Level:', self.user_info.get('userlevel', 'Admin')],
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
                if value and str(value) != 'ALL':
                    filter_data.append([key.replace('_', ' ').title() + ':', str(value)])
            
            if len(filter_data) > 1:
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
    
    def generate_establishments_report(self):
        """Generate establishments report"""
        self._setup_styles()
        self.doc = SimpleDocTemplate(self.buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
        
        self._add_header()
        self._add_title_page('establishments')
        
        # Statistics
        total = len(self.report_data)
        active = sum(1 for r in self.report_data if r.get('is_active', False))
        inactive = total - active
        
        stats_title = Paragraph("<b>SUMMARY STATISTICS</b>", self.styles['Heading2'])
        self.story.append(stats_title)
        self.story.append(Spacer(1, 0.2*inch))
        
        stats_data = [
            ['Metric', 'Value'],
            ['Total Establishments', str(total)],
            ['Active', str(active)],
            ['Inactive', str(inactive)],
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
        
        # Data table
        if not self.report_data:
            no_data = Paragraph("<b>No establishment records found for the selected filters.</b>", self.styles['Normal'])
            self.story.append(no_data)
        else:
            data_title = Paragraph("<b>ESTABLISHMENT DATA</b>", self.styles['Heading2'])
            self.story.append(data_title)
            self.story.append(Spacer(1, 0.2*inch))
            
            headers = ['Name', 'Nature of Business', 'Province', 'City', 'Barangay', 'Date Added', 'Status']
            
            data_rows = [headers]
            for record in self.report_data:
                created_at = record.get('created_at', '')
                if created_at:
                    try:
                        if 'T' in created_at:
                            created_at = created_at.split('T')[0]
                        created_at = created_at[:10]
                    except:
                        pass
                
                status = 'Active' if record.get('is_active', False) else 'Inactive'
                status_color = self.light_green if record.get('is_active', False) else self.light_red
                
                row = [
                    record.get('name', 'N/A')[:30],
                    record.get('nature_of_business', 'N/A')[:25],
                    record.get('province', 'N/A')[:15],
                    record.get('city', 'N/A')[:20],
                    record.get('barangay', 'N/A')[:20],
                    created_at or 'N/A',
                    status,
                ]
                data_rows.append(row)
            
            col_widths = [1.5*inch, 1.5*inch, 1*inch, 1*inch, 1*inch, 0.8*inch, 0.7*inch]
            data_table = Table(data_rows, colWidths=col_widths, repeatRows=1)
            data_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.gov_blue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('FONTNAME', (0, 1), (-1, -1), 'Times-Roman'),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [self.light_blue, colors.white]),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            self.story.append(data_table)
        
        self.doc.build(self.story)
    
    def generate_users_report(self):
        """Generate users report"""
        self._setup_styles()
        self.doc = SimpleDocTemplate(self.buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
        
        self._add_header()
        self._add_title_page('users')
        
        # Statistics
        total = len(self.report_data)
        active = sum(1 for r in self.report_data if r.get('is_active', False))
        inactive = total - active
        
        stats_title = Paragraph("<b>SUMMARY STATISTICS</b>", self.styles['Heading2'])
        self.story.append(stats_title)
        self.story.append(Spacer(1, 0.2*inch))
        
        stats_data = [
            ['Metric', 'Value'],
            ['Total Users', str(total)],
            ['Active', str(active)],
            ['Inactive', str(inactive)],
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
        
        # Data table
        if not self.report_data:
            no_data = Paragraph("<b>No user records found for the selected filters.</b>", self.styles['Normal'])
            self.story.append(no_data)
        else:
            data_title = Paragraph("<b>USER DATA</b>", self.styles['Heading2'])
            self.story.append(data_title)
            self.story.append(Spacer(1, 0.2*inch))
            
            headers = ['Name', 'Email', 'User Level', 'Section', 'Date Joined', 'Last Updated', 'Status']
            
            data_rows = [headers]
            for record in self.report_data:
                date_joined = record.get('date_joined', '')
                if date_joined:
                    try:
                        if 'T' in date_joined:
                            date_joined = date_joined.split('T')[0]
                        date_joined = date_joined[:10]
                    except:
                        pass
                
                updated_at = record.get('updated_at', '')
                if updated_at:
                    try:
                        if 'T' in updated_at:
                            updated_at = updated_at.split('T')[0]
                        updated_at = updated_at[:10]
                    except:
                        pass
                
                status = 'Active' if record.get('is_active', False) else 'Inactive'
                
                row = [
                    record.get('full_name', record.get('email', 'N/A'))[:25],
                    record.get('email', 'N/A')[:30],
                    record.get('userlevel', 'N/A')[:15],
                    record.get('section', 'N/A') or 'N/A',
                    date_joined or 'N/A',
                    updated_at or 'N/A',
                    status,
                ]
                data_rows.append(row)
            
            col_widths = [1.5*inch, 1.8*inch, 1.2*inch, 1*inch, 0.9*inch, 0.9*inch, 0.7*inch]
            data_table = Table(data_rows, colWidths=col_widths, repeatRows=1)
            data_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.gov_blue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('FONTNAME', (0, 1), (-1, -1), 'Times-Roman'),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [self.light_blue, colors.white]),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            self.story.append(data_table)
        
        self.doc.build(self.story)

