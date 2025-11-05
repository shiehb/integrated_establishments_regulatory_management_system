# Generated migration for adding month field to ComplianceQuota

from django.db import migrations, models


def check_column_exists(schema_editor, table_name, column_name):
    """Check if a column exists in the table"""
    from django.db import connection
    
    with connection.cursor() as cursor:
        if connection.vendor == 'mysql':
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = %s 
                AND COLUMN_NAME = %s
            """, [table_name, column_name])
        else:
            # For PostgreSQL/SQLite
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.COLUMNS 
                WHERE TABLE_NAME = %s 
                AND COLUMN_NAME = %s
            """, [table_name, column_name])
        
        return cursor.fetchone()[0] > 0


def migrate_existing_quotas_to_monthly(apps, schema_editor):
    """
    Migrate existing quarterly quotas to monthly quotas.
    For each existing quota, create monthly quotas for all months in that quarter.
    """
    from django.db import connection
    
    # First check if month column exists
    if not check_column_exists(schema_editor, 'inspections_compliancequota', 'month'):
        return  # Column doesn't exist, nothing to migrate
    
    # Check if there are any existing quotas
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM inspections_compliancequota WHERE month IS NULL")
        count = cursor.fetchone()[0]
        
        if count == 0:
            return  # No data to migrate
    
    # Get the model
    ComplianceQuota = apps.get_model('inspections', 'ComplianceQuota')
    
    # Get all existing quotas with NULL month
    existing_quotas = list(ComplianceQuota.objects.filter(month__isnull=True))
    
    if not existing_quotas:
        return  # No quotas to migrate
    
    quotas_to_create = []
    quotas_to_delete = []
    
    for quota in existing_quotas:
        # Get months in the quarter
        if quota.quarter == 1:
            months = [1, 2, 3]
        elif quota.quarter == 2:
            months = [4, 5, 6]
        elif quota.quarter == 3:
            months = [7, 8, 9]
        else:  # quarter == 4
            months = [10, 11, 12]
        
        # Create a monthly quota for each month in the quarter
        for month in months:
            # Check if monthly quota already exists
            if not ComplianceQuota.objects.filter(
                law=quota.law,
                year=quota.year,
                month=month
            ).exists():
                quotas_to_create.append(
                    ComplianceQuota(
                        law=quota.law,
                        year=quota.year,
                        month=month,
                        quarter=quota.quarter,
                        target=quota.target,
                        auto_adjusted=quota.auto_adjusted,
                        created_by=quota.created_by,
                        created_at=quota.created_at,
                        updated_at=quota.updated_at
                    )
                )
        
        # Mark old quota for deletion (will be deleted after migration)
        quotas_to_delete.append(quota.id)
    
    # Bulk create new monthly quotas (ignore conflicts in case of duplicates)
    if quotas_to_create:
        # Use bulk_create with ignore_conflicts to handle any duplicates
        ComplianceQuota.objects.bulk_create(quotas_to_create, ignore_conflicts=True)
    
    # Delete old quarterly-only quotas after creating monthly ones
    if quotas_to_delete:
        ComplianceQuota.objects.filter(id__in=quotas_to_delete).delete()


def reverse_migration(apps, schema_editor):
    """
    Reverse migration: aggregate monthly quotas back to quarterly
    Keep only the first month of each quarter for each law
    """
    ComplianceQuota = apps.get_model('inspections', 'ComplianceQuota')
    
    # Get all unique combinations of law, year, quarter
    from django.db.models import Min
    
    # Get all unique combinations
    quotas = ComplianceQuota.objects.values('law', 'year', 'quarter').distinct()
    
    for combo in quotas:
        # Get all monthly quotas for this quarter
        monthly_quotas = ComplianceQuota.objects.filter(
            law=combo['law'],
            year=combo['year'],
            quarter=combo['quarter']
        ).order_by('month')
        
        if monthly_quotas.exists():
            # Keep first month's quota, delete others
            first = monthly_quotas.first()
            monthly_quotas.exclude(id=first.id).delete()


def ensure_month_column(apps, schema_editor):
    """Ensure month column exists, add it if it doesn't"""
    from django.db import connection
    
    table_name = 'inspections_compliancequota'
    column_name = 'month'
    
    if not check_column_exists(schema_editor, table_name, column_name):
        with connection.cursor() as cursor:
            if connection.vendor == 'mysql':
                cursor.execute("""
                    ALTER TABLE inspections_compliancequota 
                    ADD COLUMN month INT NULL
                """)
            else:
                cursor.execute("""
                    ALTER TABLE inspections_compliancequota 
                    ADD COLUMN month INTEGER NULL
                """)


def ensure_month_not_null(apps, schema_editor):
    """Ensure month column is NOT NULL, update it if it's nullable"""
    from django.db import connection
    
    table_name = 'inspections_compliancequota'
    column_name = 'month'
    
    if check_column_exists(schema_editor, table_name, column_name):
        with connection.cursor() as cursor:
            # Check if column is nullable
            if connection.vendor == 'mysql':
                cursor.execute("""
                    SELECT IS_NULLABLE 
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = %s 
                    AND COLUMN_NAME = %s
                """, [table_name, column_name])
            else:
                cursor.execute("""
                    SELECT IS_NULLABLE 
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_NAME = %s 
                    AND COLUMN_NAME = %s
                """, [table_name, column_name])
            
            result = cursor.fetchone()
            if result and result[0] == 'YES':  # Column is nullable
                # Update any NULL values first (set to first month of quarter)
                if connection.vendor == 'mysql':
                    cursor.execute("""
                        UPDATE inspections_compliancequota 
                        SET month = CASE 
                            WHEN quarter = 1 THEN 1
                            WHEN quarter = 2 THEN 4
                            WHEN quarter = 3 THEN 7
                            WHEN quarter = 4 THEN 10
                            ELSE 1
                        END
                        WHERE month IS NULL
                    """)
                else:
                    cursor.execute("""
                        UPDATE inspections_compliancequota 
                        SET month = CASE 
                            WHEN quarter = 1 THEN 1
                            WHEN quarter = 2 THEN 4
                            WHEN quarter = 3 THEN 7
                            WHEN quarter = 4 THEN 10
                            ELSE 1
                        END
                        WHERE month IS NULL
                    """)
                
                # Make column NOT NULL
                if connection.vendor == 'mysql':
                    cursor.execute("""
                        ALTER TABLE inspections_compliancequota 
                        MODIFY COLUMN month INT NOT NULL
                    """)
                else:
                    cursor.execute("""
                        ALTER TABLE inspections_compliancequota 
                        ALTER COLUMN month SET NOT NULL
                    """)


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0008_rename_inspections_law_yea_quarter_idx_inspections_law_f4ff83_idx_and_more'),
    ]

    operations = [
        # Step 1: Ensure month column exists (add if it doesn't)
        migrations.RunPython(ensure_month_column, migrations.RunPython.noop),
        # Step 2: Migrate existing data (only if needed)
        migrations.RunPython(migrate_existing_quotas_to_monthly, reverse_migration),
        # Step 3: Ensure month field is NOT NULL
        migrations.RunPython(ensure_month_not_null, migrations.RunPython.noop),
        # Step 4: Update unique constraint - remove old, add new
        migrations.RunSQL(
            sql="""
                SET @dbname = DATABASE();
                SET @tablename = 'inspections_compliancequota';
                SET @old_index = 'inspections_compliancequota_law_year_quarter_uniq';
                SET @new_index = 'inspections_compliancequota_law_year_month_uniq';
                
                SET @preparedStatement = (
                    SELECT IF(
                        (SELECT COUNT(*) FROM information_schema.STATISTICS 
                         WHERE table_schema = @dbname 
                         AND table_name = @tablename 
                         AND index_name = @old_index) > 0,
                        CONCAT('ALTER TABLE ', @tablename, ' DROP INDEX ', @old_index),
                        'SELECT 1'
                    )
                );
                PREPARE stmt FROM @preparedStatement;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
                
                -- Add new unique constraint
                ALTER TABLE inspections_compliancequota 
                ADD UNIQUE KEY inspections_compliancequota_law_year_month_uniq (law, year, month);
            """,
            reverse_sql="""
                ALTER TABLE inspections_compliancequota 
                DROP INDEX IF EXISTS inspections_compliancequota_law_year_month_uniq;
                
                ALTER TABLE inspections_compliancequota 
                ADD UNIQUE KEY inspections_compliancequota_law_year_quarter_uniq (law, year, quarter);
            """,
        ),
        # Step 5: Update ordering (this is just metadata, no DB change)
        migrations.AlterModelOptions(
            name='compliancequota',
            options={'ordering': ['year', 'month', 'law']},
        ),
    ]
