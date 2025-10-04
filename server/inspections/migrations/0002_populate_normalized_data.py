# Data migration to populate normalized tables
from django.db import migrations


def populate_normalized_data(apps, schema_editor):
    """Populate the normalized tables with initial data"""
    Law = apps.get_model('inspections', 'Law')
    InspectionStatus = apps.get_model('inspections', 'InspectionStatus')
    WorkflowAction = apps.get_model('inspections', 'WorkflowAction')
    ComplianceStatus = apps.get_model('inspections', 'ComplianceStatus')
    WorkflowRule = apps.get_model('inspections', 'WorkflowRule')
    
    # Create Law records
    laws_data = [
        {
            'code': 'PD-1586',
            'name': 'Philippine Environmental Impact Statement System',
            'description': 'Presidential Decree 1586 - Environmental Impact Statement System',
            'has_unit_head': True
        },
        {
            'code': 'RA-6969',
            'name': 'Toxic Substances and Hazardous and Nuclear Wastes Control Act',
            'description': 'Republic Act 6969 - Toxic Substances and Hazardous and Nuclear Wastes Control Act',
            'has_unit_head': False
        },
        {
            'code': 'RA-8749',
            'name': 'Philippine Clean Air Act',
            'description': 'Republic Act 8749 - Philippine Clean Air Act',
            'has_unit_head': True
        },
        {
            'code': 'RA-9275',
            'name': 'Philippine Clean Water Act',
            'description': 'Republic Act 9275 - Philippine Clean Water Act',
            'has_unit_head': True
        },
        {
            'code': 'RA-9003',
            'name': 'Ecological Solid Waste Management Act',
            'description': 'Republic Act 9003 - Ecological Solid Waste Management Act',
            'has_unit_head': False
        }
    ]
    
    for law_data in laws_data:
        Law.objects.get_or_create(
            code=law_data['code'],
            defaults=law_data
        )
    
    # Create InspectionStatus records
    statuses_data = [
        ('DIVISION_CREATED', 'Division Created', False),
        ('SECTION_ASSIGNED', 'Section Assigned', False),
        ('SECTION_IN_PROGRESS', 'Section In Progress', False),
        ('SECTION_COMPLETED', 'Section Completed', False),
        ('UNIT_ASSIGNED', 'Unit Assigned', False),
        ('UNIT_IN_PROGRESS', 'Unit In Progress', False),
        ('UNIT_COMPLETED', 'Unit Completed', False),
        ('MONITORING_ASSIGN', 'Monitoring Assignment', False),
        ('MONITORING_IN_PROGRESS', 'Monitoring In Progress', False),
        ('MONITORING_COMPLETED_COMPLIANT', 'Monitoring Completed - Compliant', False),
        ('NON_COMPLIANT_RETURN', 'Non-Compliant Return', False),
        ('UNIT_REVIEWED', 'Unit Reviewed', False),
        ('SECTION_REVIEWED', 'Section Reviewed', False),
        ('DIVISION_REVIEWED', 'Division Reviewed', False),
        ('LEGAL_REVIEW', 'Legal Review', False),
        ('NOV_SENT', 'Notice of Violation Sent', False),
        ('NOO_SENT', 'Notice of Order Sent', False),
        ('CLOSED', 'Closed', True),
        ('REJECTED', 'Rejected', True),
    ]
    
    for code, name, is_final in statuses_data:
        InspectionStatus.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'is_final': is_final
            }
        )
    
    # Create WorkflowAction records
    actions_data = [
        ('INSPECT', 'Inspect'),
        ('START_INSPECTION', 'Start Inspection'),
        ('COMPLETE_INSPECTION', 'Complete Inspection'),
        ('FORWARD', 'Forward'),
        ('FORWARD_TO_UNIT', 'Forward to Unit Head'),
        ('FORWARD_TO_MONITORING', 'Forward to Monitoring'),
        ('FORWARD_TO_ANOTHER_SECTION', 'Forward to Another Section'),
        ('FORWARD_TO_MONITORING_PERSONNEL', 'Forward to Monitoring Personnel'),
        ('COMPLETE', 'Complete'),
        ('COMPLETE_COMPLIANT', 'Complete - Compliant'),
        ('COMPLETE_NON_COMPLIANT', 'Complete - Non-Compliant'),
        ('REVIEW', 'Review'),
        ('FORWARD_TO_DIVISION', 'Forward to Division'),
        ('FORWARD_TO_SECTION', 'Forward to Section'),
        ('FORWARD_TO_LEGAL', 'Forward to Legal Unit'),
        ('SEND_NOV', 'Send Notice of Violation'),
        ('SEND_NOO', 'Send Notice of Order'),
        ('CLOSE_CASE', 'Close Case'),
        ('REJECT', 'Reject'),
    ]
    
    for code, name in actions_data:
        WorkflowAction.objects.get_or_create(
            code=code,
            defaults={'name': name}
        )
    
    # Create ComplianceStatus records
    compliance_data = [
        ('PENDING', 'Pending Inspection'),
        ('COMPLIANT', 'Compliant'),
        ('NON_COMPLIANT', 'Non-Compliant'),
        ('PARTIALLY_COMPLIANT', 'Partially Compliant'),
    ]
    
    for code, name in compliance_data:
        ComplianceStatus.objects.get_or_create(
            code=code,
            defaults={'name': name}
        )
    
    # Create WorkflowRule records
    rules_data = [
        # Division Chief rules
        ('DIVISION_CREATED', 'Division Chief', 'FORWARD_TO_SECTION', 'SECTION_ASSIGNED'),
        ('DIVISION_REVIEWED', 'Division Chief', 'REVIEW', 'LEGAL_REVIEW'),
        
        # Section Chief rules
        ('SECTION_ASSIGNED', 'Section Chief', 'INSPECT', 'SECTION_IN_PROGRESS'),
        ('SECTION_ASSIGNED', 'Section Chief', 'FORWARD_TO_UNIT', 'UNIT_ASSIGNED'),
        ('SECTION_ASSIGNED', 'Section Chief', 'FORWARD_TO_MONITORING', 'MONITORING_ASSIGN'),
        ('SECTION_IN_PROGRESS', 'Section Chief', 'COMPLETE_INSPECTION', 'SECTION_COMPLETED'),
        
        # Unit Head rules
        ('UNIT_ASSIGNED', 'Unit Head', 'INSPECT', 'UNIT_IN_PROGRESS'),
        ('UNIT_ASSIGNED', 'Unit Head', 'FORWARD_TO_MONITORING', 'MONITORING_ASSIGN'),
        ('UNIT_IN_PROGRESS', 'Unit Head', 'COMPLETE_INSPECTION', 'UNIT_COMPLETED'),
        
        # Monitoring Personnel rules
        ('MONITORING_ASSIGN', 'Monitoring Personnel', 'START_INSPECTION', 'MONITORING_IN_PROGRESS'),
        ('MONITORING_IN_PROGRESS', 'Monitoring Personnel', 'COMPLETE_COMPLIANT', 'MONITORING_COMPLETED_COMPLIANT'),
        ('MONITORING_IN_PROGRESS', 'Monitoring Personnel', 'COMPLETE_NON_COMPLIANT', 'NON_COMPLIANT_RETURN'),
        
        # Legal Unit rules
        ('LEGAL_REVIEW', 'Legal Unit', 'SEND_NOV', 'NOV_SENT'),
        ('LEGAL_REVIEW', 'Legal Unit', 'SEND_NOO', 'NOO_SENT'),
        ('LEGAL_REVIEW', 'Legal Unit', 'CLOSE_CASE', 'CLOSED'),
        ('NOV_SENT', 'Legal Unit', 'SEND_NOO', 'NOO_SENT'),
        ('NOV_SENT', 'Legal Unit', 'CLOSE_CASE', 'CLOSED'),
        ('NOO_SENT', 'Legal Unit', 'CLOSE_CASE', 'CLOSED'),
    ]
    
    for status_code, user_level, action_code, next_status_code in rules_data:
        try:
            status = InspectionStatus.objects.get(code=status_code)
            action = WorkflowAction.objects.get(code=action_code)
            next_status = InspectionStatus.objects.get(code=next_status_code) if next_status_code else None
            
            WorkflowRule.objects.get_or_create(
                status=status,
                user_level=user_level,
                action=action,
                defaults={'next_status': next_status}
            )
        except (InspectionStatus.DoesNotExist, WorkflowAction.DoesNotExist):
            # Skip if references don't exist
            pass


def reverse_populate_normalized_data(apps, schema_editor):
    """Reverse the data population"""
    Law = apps.get_model('inspections', 'Law')
    InspectionStatus = apps.get_model('inspections', 'InspectionStatus')
    WorkflowAction = apps.get_model('inspections', 'WorkflowAction')
    ComplianceStatus = apps.get_model('inspections', 'ComplianceStatus')
    WorkflowRule = apps.get_model('inspections', 'WorkflowRule')
    
    # Delete all records
    WorkflowRule.objects.all().delete()
    ComplianceStatus.objects.all().delete()
    WorkflowAction.objects.all().delete()
    InspectionStatus.objects.all().delete()
    Law.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0001_normalize_models'),
    ]

    operations = [
        migrations.RunPython(
            populate_normalized_data,
            reverse_populate_normalized_data
        ),
    ]
