"""
Legal Report PDF Generator using reportlab
Generates professional PDF reports with government formatting
"""
import os
import io
from datetime import datetime
from django.conf import settings
from reportlab.lib.pagesizes import letter, A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY


class LegalReportPDFGenerator:
    """
    Professional PDF generator for legal reports
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
        logo1_path = self._get_logo_path(1)
        logo2_path = self._get_logo_path(2)
        
        header_data = []
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
        header_table = Table(header_data, colWidths=[1.5*inch, 7*inch, 1.5*inch])
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
    
    def _add_title_page(self):
        """Add professional title page"""
        # Report title
        title_text = "<para align='center'><b><font size='18' color='#0066CC'>LEGAL UNIT REPORT</font></b></para>"
        self.story.append(Paragraph(title_text, self.styles['GovernmentTitle']))
        
        subtitle_text = "<para align='center'><font size='14' color='#008000'>Billing and Compliance Summary</font></para>"
        self.story.append(Paragraph(subtitle_text, self.styles['GovernmentSubtitle']))
        
        self.story.append(Spacer(1, 0.2*inch))
        
        # Generation info
        gen_date = datetime.now().strftime("%B %d, %Y")
        date_text = f"<para align='center'><font size='10'>Generated on: {gen_date}</font></para>"
        self.story.append(Paragraph(date_text, self.styles['Normal']))
        
        self.story.append(Spacer(1, 0.3*inch))
        
        # Report metadata
        metadata_data = [
            ['Report ID:', f"LEGAL-RPT-{int(datetime.now().timestamp() * 1000)}"],
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
            self.story.append(Paragraph("<b>FILTERS APPLIED</b>", self.styles['SectionHeader']))
            
            filters_data = []
            for key, value in self.filters_applied.items():
                if value and value != 'All':
                    filters_data.append([key.replace('_', ' ').title(), str(value)])
            
            if filters_data:
                filters_table = Table(filters_data, colWidths=[2*inch, 4*inch])
                filters_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Times-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Times-Roman'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('PADDING', (0, 0), (-1, -1), 6),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                    ('BACKGROUND', (0, 0), (0, -1), self.light_blue),
                ]))
                self.story.append(filters_table)
        
        self.story.append(PageBreak())
    
    def _add_statistics_section(self):
        """Add summary statistics section"""
        self.story.append(Paragraph("<b>SUMMARY STATISTICS</b>", self.styles['SectionHeader']))
        
        stats = self.report_data.get('statistics', {})
        billing_stats = stats.get('billing_summary', {})
        compliance_stats = stats.get('compliance_summary', {})
        
        # Billing summary
        billing_data = [
            ['BILLING SUMMARY', ''],
            ['Total Billed Amount', f"₱{billing_stats.get('total_billed', 0):,.2f}"],
            ['Total Paid Amount', f"₱{billing_stats.get('total_paid', 0):,.2f}"],
            ['Outstanding Balance', f"₱{billing_stats.get('outstanding_balance', 0):,.2f}"],
            ['Average Days to Payment', f"{billing_stats.get('avg_days_to_payment', 0):.1f} days"],
            ['Total NOV Issued', str(billing_stats.get('total_nov', 0))],
            ['Total NOO Issued', str(billing_stats.get('total_noo', 0))],
        ]
        
        billing_table = Table(billing_data, colWidths=[3*inch, 2*inch])
        billing_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), self.gov_blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('SPAN', (0, 0), (1, 0)),
            
            # Data rows
            ('FONTNAME', (0, 1), (0, -1), 'Times-Bold'),
            ('FONTNAME', (1, 1), (1, -1), 'Times-Roman'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (0, -1), self.light_blue),
        ]))
        
        self.story.append(billing_table)
        self.story.append(Spacer(1, 0.2*inch))
        
        # Compliance summary
        compliance_data = [
            ['COMPLIANCE SUMMARY', ''],
            ['Compliant Establishments', str(compliance_stats.get('compliant_count', 0))],
            ['Non-Compliant Establishments', str(compliance_stats.get('non_compliant_count', 0))],
            ['Pending Actions', str(compliance_stats.get('pending_count', 0))],
            ['Re-inspections Recommended', str(compliance_stats.get('reinspection_recommended', 0))],
        ]
        
        compliance_table = Table(compliance_data, colWidths=[3*inch, 2*inch])
        compliance_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), self.gov_green),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('SPAN', (0, 0), (1, 0)),
            
            # Data rows
            ('FONTNAME', (0, 1), (0, -1), 'Times-Bold'),
            ('FONTNAME', (1, 1), (1, -1), 'Times-Roman'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (0, -1), self.light_green),
        ]))
        
        self.story.append(compliance_table)
        self.story.append(Spacer(1, 0.2*inch))
    
    def _add_detailed_data_table(self):
        """Add detailed billing data table"""
        self.story.append(Paragraph("<b>DETAILED BILLING RECORDS</b>", self.styles['SectionHeader']))
        
        records = self.report_data.get('records', [])
        
        if not records:
            self.story.append(Paragraph("<b>No billing records found for the selected filters.</b>", 
                                       self.styles['Normal']))
            return
        
        # Table headers
        table_data = [[
            'Inspection No.', 'Establishment', 'Amount', 'Billing Date',
            'Payment Status', 'NOV/NOO', 'Compliance'
        ]]
        
        # Add data rows (limit to avoid huge PDFs)
        for record in records[:50]:  # Limit to 50 records
            billing_date = record.get('sent_date', '')
            if billing_date:
                try:
                    billing_date = datetime.fromisoformat(billing_date.replace('Z', '+00:00')).strftime('%Y-%m-%d')
                except:
                    pass
            
            nov_noo = []
            if record.get('has_nov'):
                nov_noo.append('NOV')
            if record.get('has_noo'):
                nov_noo.append('NOO')
            
            table_data.append([
                record.get('inspection_code', 'N/A')[:15],
                record.get('establishment_name', 'N/A')[:25],
                f"₱{record.get('amount', 0):,.0f}",
                billing_date[:10] if billing_date else 'N/A',
                record.get('payment_status', 'UNPAID')[:10],
                ', '.join(nov_noo) if nov_noo else 'None',
                record.get('compliance_status', 'N/A')[:10]
            ])
        
        if len(records) > 50:
            table_data.append(['...', f'Showing first 50 of {len(records)} records', '', '', '', '', ''])
        
        # Create table
        data_table = Table(table_data, colWidths=[
            1.2*inch, 2*inch, 0.8*inch, 1*inch, 0.9*inch, 0.8*inch, 1*inch
        ])
        
        data_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), self.gov_blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            
            # Data row styling
            ('FONTNAME', (0, 1), (-1, -1), 'Times-Roman'),
            ('FONTSIZE', (0, 1), (-1, -1), 7),
            ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ('PADDING', (0, 1), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Borders
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            
            # Alternating colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.light_blue]),
        ]))
        
        self.story.append(data_table)
        self.story.append(Spacer(1, 0.2*inch))
    
    def _add_recommendations_section(self):
        """Add recommendations section"""
        self.story.append(PageBreak())
        self.story.append(Paragraph("<b>RECOMMENDATIONS</b>", self.styles['SectionHeader']))
        
        recommendations = self.report_data.get('recommendations', [])
        
        if recommendations:
            for idx, rec in enumerate(recommendations, start=1):
                rec_text = f"<b>{idx}. {rec.get('type', 'Recommendation')}:</b> {rec.get('description', '')}"
                self.story.append(Paragraph(rec_text, self.styles['Justified']))
                self.story.append(Spacer(1, 0.1*inch))
        else:
            self.story.append(Paragraph("No specific recommendations at this time.", self.styles['Normal']))
        
        self.story.append(Spacer(1, 0.3*inch))
        
        # Signature panel
        self.story.append(Paragraph("<b>PREPARED AND REVIEWED BY:</b>", self.styles['SectionHeader']))
        
        signature_data = [
            ['Prepared by:', '', 'Reviewed by:', ''],
            ['', '', '', ''],
            ['_____________________', '', '_____________________', ''],
            [f"{self.user_info.first_name} {self.user_info.last_name}", '', '', ''],
            ['Legal Unit', '', 'Division Chief', ''],
            ['Date: _____________', '', 'Date: _____________', ''],
        ]
        
        sig_table = Table(signature_data, colWidths=[2.5*inch, 0.5*inch, 2.5*inch, 0.5*inch])
        sig_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        self.story.append(sig_table)
    
    def _add_footer(self, canvas, doc):
        """Add professional footer with page numbers"""
        canvas.saveState()
        
        # Footer line
        canvas.setStrokeColor(self.gov_blue)
        canvas.setLineWidth(1)
        canvas.line(50, 50, doc.pagesize[0] - 50, 50)
        
        # Footer text
        canvas.setFont('Times-Roman', 8)
        canvas.setFillColor(colors.grey)
        
        # Page number
        page_text = f"Page {canvas.getPageNumber()}"
        canvas.drawString(50, 35, page_text)
        
        # Report ID
        report_id = f"LEGAL-RPT-{int(datetime.now().timestamp() * 1000)}"
        canvas.drawString(doc.pagesize[0] / 2 - 100, 35, f"Report ID: {report_id}")
        
        # Timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        canvas.drawString(doc.pagesize[0] - 200, 35, f"Generated: {timestamp}")
        
        canvas.restoreState()
    
    def generate(self):
        """Main method to generate the complete PDF report"""
        try:
            # Create document with landscape orientation
            self.doc = SimpleDocTemplate(
                self.buffer,
                pagesize=landscape(A4),
                rightMargin=50,
                leftMargin=50,
                topMargin=72,
                bottomMargin=60
            )
            
            # Setup styles
            self._setup_styles()
            
            # Build story
            self._add_header()
            self._add_title_page()
            self._add_statistics_section()
            self._add_detailed_data_table()
            self._add_recommendations_section()
            
            # Build PDF with footer
            self.doc.build(self.story, onFirstPage=self._add_footer, onLaterPages=self._add_footer)
            
        except Exception as e:
            print(f"PDF Generation Error: {str(e)}")
            raise e

