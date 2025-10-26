import os
import io
from datetime import datetime
from django.conf import settings
from reportlab.lib.pagesizes import letter, A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import PageBreak, KeepTogether

class AccomplishmentReportPDFGenerator:
    """
    Professional PDF generator for accomplishment reports
    """
    
    def __init__(self, buffer, report_data, user_info):
        self.buffer = buffer
        self.report_data = report_data
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
        
        # Title style
        self.styles.add(ParagraphStyle(
            name='GovernmentTitle',
            parent=self.styles['Title'],
            fontSize=16,
            spaceAfter=12,
            alignment=TA_CENTER,
            textColor=self.gov_blue,
            fontName='Times-Bold'
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='GovernmentSubtitle',
            parent=self.styles['Heading1'],
            fontSize=14,
            spaceAfter=8,
            alignment=TA_CENTER,
            textColor=self.gov_green,
            fontName='Times-Bold'
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceAfter=6,
            spaceBefore=12,
            textColor=self.gov_blue,
            fontName='Times-Bold'
        ))
        
        # Normal text with justified alignment
        self.styles.add(ParagraphStyle(
            name='Justified',
            parent=self.styles['Normal'],
            alignment=TA_JUSTIFY,
            fontSize=10,
            fontName='Times-Roman'
        ))
        
        # Footer style
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            alignment=TA_CENTER,
            textColor=colors.grey,
            fontName='Times-Roman'
        ))
    
    def _get_logo_path(self, logo_num):
        """Get logo path with fallback"""
        path = self.LOGO1_PATH if logo_num == 1 else self.LOGO2_PATH
        return path if os.path.exists(path) else None
    
    def _add_header(self):
        """Add professional government header with logos"""
        # Load logos if available
        logo1_path = self._get_logo_path(1)
        logo2_path = self._get_logo_path(2)
        
        # Header table with logos and text
        header_data = []
        
        # Create header row
        header_row = []
        
        # Left logo
        if logo1_path:
            try:
                logo1 = Image(logo1_path, width=0.8*inch, height=0.8*inch)
                header_row.append(logo1)
            except:
                header_row.append('')
        else:
            header_row.append('')
        
        # Center text
        header_text = """
        <b><font size="14" color="#0066CC">REPUBLIC OF THE PHILIPPINES</font></b><br/>
        <b><font size="12" color="#008000">DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES</font></b><br/>
        <b><font size="12" color="#008000">ENVIRONMENTAL MANAGEMENT BUREAU</font></b><br/>
        <b><font size="12" color="#008000">REGION I</font></b>
        """
        header_row.append(Paragraph(header_text, self.styles['GovernmentSubtitle']))
        
        # Right logo
        if logo2_path:
            try:
                logo2 = Image(logo2_path, width=0.8*inch, height=0.8*inch)
                header_row.append(logo2)
            except:
                header_row.append('')
        else:
            header_row.append('')
        
        header_data.append(header_row)
        
        # Create header table
        header_table = Table(header_data, colWidths=[1*inch, 4*inch, 1*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        self.story.append(header_table)
        self.story.append(Spacer(1, 0.2*inch))
    
    def _add_cover_page(self):
        """Add professional cover page"""
        # Report title
        title_text = "<para align='center'><b><font size='16' color='#0066CC'>ACCOMPLISHMENT REPORT</font></b></para>"
        self.story.append(Paragraph(title_text, self.styles['GovernmentTitle']))
        
        # Underline for title
        self.story.append(Spacer(1, 0.1*inch))
        
        # Period information
        period_text = f"<para align='center'><font size='12' color='#008000'>Period: {self.report_data.get('period_text', 'N/A')}</font></para>"
        self.story.append(Paragraph(period_text, self.styles['GovernmentSubtitle']))
        
        # Generation date
        gen_date = datetime.now().strftime("%B %d, %Y")
        date_text = f"<para align='center'><font size='10'>Generated on: {gen_date}</font></para>"
        self.story.append(Paragraph(date_text, self.styles['Normal']))
        
        self.story.append(Spacer(1, 0.3*inch))
        
        # Report metadata table
        metadata_data = [
            ['Report ID:', f"ACCOMP-RPT-{int(datetime.now().timestamp() * 1000)}"],
            ['Prepared by:', f"{self.user_info.first_name} {self.user_info.last_name}"],
            ['User Level:', self.user_info.userlevel],
            ['Email:', self.user_info.email],
            ['Generated:', datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
        ]
        
        metadata_table = Table(metadata_data, colWidths=[1.5*inch, 3*inch])
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
        self.story.append(PageBreak())
    
    def _add_executive_summary(self):
        """Add executive summary section"""
        self.story.append(Paragraph("<b>EXECUTIVE SUMMARY</b>", self.styles['SectionHeader']))
        
        stats = self.report_data.get('stats', {})
        total = stats.get('total', 0)
        compliant = stats.get('compliant', 0)
        non_compliant = stats.get('non_compliant', 0)
        compliance_rate = stats.get('compliance_rate', 0)
        
        summary_text = f"""
        This accomplishment report presents a comprehensive overview of inspection activities conducted during the reporting period. 
        A total of <b>{total}</b> inspections were completed, demonstrating the bureau's commitment to environmental compliance monitoring.

        The compliance analysis reveals that <b>{compliant}</b> establishments were found to be compliant with environmental regulations, 
        while <b>{non_compliant}</b> were identified as non-compliant. This represents an overall compliance rate of <b>{compliance_rate:.1f}%</b>, 
        indicating {'strong performance' if compliance_rate >= 80 else 'areas requiring attention'} in environmental regulation adherence.

        The detailed findings and recommendations outlined in this report will support ongoing efforts to improve environmental compliance 
        and ensure sustainable development practices across the region.
        """
        
        self.story.append(Paragraph(summary_text, self.styles['Justified']))
        self.story.append(Spacer(1, 0.2*inch))
    
    def _add_statistics_section(self):
        """Add enhanced statistics section with professional grid layout"""
        self.story.append(Paragraph("<b>SUMMARY STATISTICS</b>", self.styles['SectionHeader']))
        
        stats = self.report_data.get('stats', {})
        total = stats.get('total', 0)
        compliant = stats.get('compliant', 0)
        non_compliant = stats.get('non_compliant', 0)
        compliance_rate = stats.get('compliance_rate', 0)
        
        # Create 2x2 statistics grid
        stats_data = [
            ['Total Inspections', str(total), 'Compliant Establishments', str(compliant)],
            ['Non-Compliant Establishments', str(non_compliant), 'Compliance Rate', f'{compliance_rate:.1f}%']
        ]
        
        stats_table = Table(stats_data, colWidths=[2*inch, 1*inch, 2*inch, 1*inch])
        stats_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (0, 0), self.light_blue),
            ('BACKGROUND', (2, 0), (2, 0), self.light_green),
            ('BACKGROUND', (0, 1), (0, 1), colors.lightcoral),
            ('BACKGROUND', (2, 1), (2, 1), colors.lightyellow),
            
            # Text styling
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Times-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('PADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        self.story.append(stats_table)
        self.story.append(Spacer(1, 0.2*inch))
    
    def _add_inspection_table(self):
        """Add professional inspection data table"""
        inspections = self.report_data.get('inspections', [])
        
        if not inspections:
            self.story.append(Paragraph("<b>No inspection data available for the selected period.</b>", self.styles['Normal']))
            return
        
        self.story.append(Paragraph("<b>DETAILED INSPECTION LIST</b>", self.styles['SectionHeader']))
        
        # Table headers
        table_data = [['Inspection Code', 'Establishment Name', 'Law Type', 'Date', 'Compliance Status']]
        
        # Add inspection data
        for inspection in inspections:
            establishment_name = 'N/A'
            if hasattr(inspection, 'establishments') and inspection.establishments.exists():
                establishment_names = [est.name for est in inspection.establishments.all()]
                establishment_name = ', '.join(establishment_names) if establishment_names else 'N/A'
            elif hasattr(inspection, 'establishments_detail') and inspection.establishments_detail:
                establishment_names = [est.get('name', 'N/A') for est in inspection.establishments_detail]
                establishment_name = ', '.join(establishment_names) if establishment_names else 'N/A'
            
            compliance = 'N/A'
            if hasattr(inspection, 'form') and inspection.form:
                compliance = getattr(inspection.form, 'compliance_decision', 'N/A')
            
            date_str = 'N/A'
            if hasattr(inspection, 'updated_at') and inspection.updated_at:
                date_str = inspection.updated_at.strftime('%Y-%m-%d')
            
            table_data.append([
                inspection.code or 'N/A',
                establishment_name,
                inspection.law or 'N/A',
                date_str,
                compliance
            ])
        
        # Create professional table
        inspection_table = Table(table_data, colWidths=[1.2*inch, 2.5*inch, 1*inch, 1*inch, 1.3*inch])
        inspection_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), self.gov_blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            
            # Data row styling
            ('FONTNAME', (0, 1), (-1, -1), 'Times-Roman'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),  # Left align establishment names
            ('PADDING', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.light_blue]),
            
            # Borders
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            
            # Compliance status color coding
            ('TEXTCOLOR', (4, 1), (4, -1), colors.black),
        ]))
        
        self.story.append(inspection_table)
        self.story.append(Spacer(1, 0.2*inch))
    
    def _add_analysis_section(self):
        """Add compliance analysis and insights"""
        self.story.append(Paragraph("<b>COMPLIANCE ANALYSIS</b>", self.styles['SectionHeader']))
        
        stats = self.report_data.get('stats', {})
        compliance_rate = stats.get('compliance_rate', 0)
        
        if compliance_rate >= 90:
            analysis_text = f"""
            <b>Excellent Performance:</b> The compliance rate of {compliance_rate:.1f}% demonstrates exceptional adherence to environmental regulations. 
            This level of compliance indicates effective regulatory enforcement and strong commitment from regulated establishments 
            to maintain environmental standards.
            """
        elif compliance_rate >= 80:
            analysis_text = f"""
            <b>Good Performance:</b> The compliance rate of {compliance_rate:.1f}% shows satisfactory performance with room for improvement. 
            Continued monitoring and enforcement efforts are recommended to further enhance compliance levels.
            """
        elif compliance_rate >= 60:
            analysis_text = f"""
            <b>Moderate Performance:</b> The compliance rate of {compliance_rate:.1f}% indicates areas requiring attention. 
            Enhanced enforcement activities and increased awareness programs are recommended to improve overall compliance.
            """
        else:
            analysis_text = f"""
            <b>Needs Improvement:</b> The compliance rate of {compliance_rate:.1f}% indicates significant challenges in environmental compliance. 
            Immediate action is required, including increased enforcement activities, compliance assistance programs, 
            and stakeholder engagement to address non-compliance issues.
            """
        
        self.story.append(Paragraph(analysis_text, self.styles['Justified']))
        self.story.append(Spacer(1, 0.2*inch))
    
    def _add_footer(self, canvas, doc):
        """Add professional footer with page numbers and metadata"""
        canvas.saveState()
        
        # Footer line
        canvas.setStrokeColor(self.gov_blue)
        canvas.setLineWidth(1)
        canvas.line(50, 50, 550, 50)
        
        # Footer text
        canvas.setFont('Times-Roman', 8)
        canvas.setFillColor(colors.grey)
        
        # Page number - use canvas method for reliable page numbering
        page_text = f"Page {canvas.getPageNumber()}"
        canvas.drawString(50, 35, page_text)
        
        # Report ID
        report_id = f"ACCOMP-RPT-{int(datetime.now().timestamp() * 1000)}"
        canvas.drawString(300, 35, f"Report ID: {report_id}")
        
        # Generation timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        canvas.drawString(450, 35, f"Generated: {timestamp}")
        
        canvas.restoreState()
    
    def generate(self):
        """Main method to generate the complete PDF report"""
        try:
            # Create document with landscape orientation for better table display
            self.doc = SimpleDocTemplate(
                self.buffer,
                pagesize=landscape(A4),
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            
            # Setup styles
            self._setup_styles()
            
            # Build story
            self._add_header()
            self._add_cover_page()
            self._add_executive_summary()
            self._add_statistics_section()
            self._add_inspection_table()
            self._add_analysis_section()
            
            # Build PDF with footer
            self.doc.build(self.story, onFirstPage=self._add_footer, onLaterPages=self._add_footer)
            
        except Exception as e:
            print(f"PDF Generation Error: {str(e)}")
            raise e
