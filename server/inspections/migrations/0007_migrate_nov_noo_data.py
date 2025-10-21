# Data migration to copy existing NOV/NOO data from InspectionForm to new tables

from django.db import migrations


def migrate_nov_noo_data(apps, schema_editor):
    """
    Migrate existing NOV/NOO data from InspectionForm to new NoticeOfViolation and NoticeOfOrder tables
    """
    InspectionForm = apps.get_model('inspections', 'InspectionForm')
    NoticeOfViolation = apps.get_model('inspections', 'NoticeOfViolation')
    NoticeOfOrder = apps.get_model('inspections', 'NoticeOfOrder')
    
    # Migrate NOV data
    for form in InspectionForm.objects.all():
        # Check if form has NOV data
        if (form.nov_sent_date or form.nov_violations or 
            form.nov_compliance_instructions or form.nov_compliance_date or form.nov_remarks):
            
            # Create NOV record if it doesn't exist
            nov, created = NoticeOfViolation.objects.get_or_create(
                inspection_form=form,
                defaults={
                    'sent_date': form.nov_sent_date,
                    'compliance_deadline': form.nov_compliance_date,
                    'violations': form.nov_violations or '',
                    'compliance_instructions': form.nov_compliance_instructions or '',
                    'remarks': form.nov_remarks or '',
                    'sent_by': None  # We don't have this info in the old data
                }
            )
            
            if created:
                print(f"Created NOV record for inspection {form.inspection.code}")
    
    # Migrate NOO data
    for form in InspectionForm.objects.all():
        # Check if form has NOO data
        if (form.noo_sent_date or form.noo_violation_breakdown or 
            form.noo_penalty_fees or form.noo_payment_deadline or 
            form.noo_payment_instructions or form.noo_remarks):
            
            # Create NOO record if it doesn't exist
            noo, created = NoticeOfOrder.objects.get_or_create(
                inspection_form=form,
                defaults={
                    'sent_date': form.noo_sent_date,
                    'violation_breakdown': form.noo_violation_breakdown or '',
                    'penalty_fees': form.noo_penalty_fees,
                    'payment_deadline': form.noo_payment_deadline,
                    'payment_instructions': form.noo_payment_instructions or '',
                    'remarks': form.noo_remarks or '',
                    'sent_by': None  # We don't have this info in the old data
                }
            )
            
            if created:
                print(f"Created NOO record for inspection {form.inspection.code}")


def reverse_migrate_nov_noo_data(apps, schema_editor):
    """
    Reverse migration - copy data back to InspectionForm (for rollback)
    """
    InspectionForm = apps.get_model('inspections', 'InspectionForm')
    NoticeOfViolation = apps.get_model('inspections', 'NoticeOfViolation')
    NoticeOfOrder = apps.get_model('inspections', 'NoticeOfOrder')
    
    # Copy NOV data back
    for nov in NoticeOfViolation.objects.all():
        form = nov.inspection_form
        form.nov_sent_date = nov.sent_date
        form.nov_compliance_date = nov.compliance_deadline
        form.nov_violations = nov.violations
        form.nov_compliance_instructions = nov.compliance_instructions
        form.nov_remarks = nov.remarks
        form.save()
    
    # Copy NOO data back
    for noo in NoticeOfOrder.objects.all():
        form = noo.inspection_form
        form.noo_sent_date = noo.sent_date
        form.noo_violation_breakdown = noo.violation_breakdown
        form.noo_penalty_fees = noo.penalty_fees
        form.noo_payment_deadline = noo.payment_deadline
        form.noo_payment_instructions = noo.payment_instructions
        form.noo_remarks = noo.remarks
        form.save()


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0006_noticeofviolation_noticeoforder'),
    ]

    operations = [
        migrations.RunPython(
            migrate_nov_noo_data,
            reverse_migrate_nov_noo_data,
        ),
    ]
