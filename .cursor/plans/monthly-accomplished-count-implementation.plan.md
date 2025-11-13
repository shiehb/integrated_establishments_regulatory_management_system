# Monthly Accomplished Count Implementation Plan

## Problem Statement
Currently, when users select different months in the quota dashboard, the accomplished count does NOT change. This is because:
1. The `accomplished` property calculates counts for the entire quarter (e.g., Q1 = Jan+Feb+Mar)
2. Selecting "February" still shows accomplishments for the entire Q1, not just February
3. Users need to see month-specific accomplishment counts that change when selecting different months

## Solution Overview
Add monthly accomplishment calculation methods to the backend while maintaining backward compatibility with quarterly storage. The API will calculate month-specific accomplishments when a month parameter is provided.

## Implementation Steps

### 1. Backend Model Updates
**File:** `server/inspections/models.py`

Add methods to ComplianceQuota model:

```python
def get_month_dates(self, month):
    """Get start and end dates for a specific month"""
    from django.utils import timezone
    from calendar import monthrange
    
    # Get last day of month (handles leap years)
    last_day = monthrange(self.year, month)[1]
    
    start = timezone.datetime(self.year, month, 1, 0, 0, 0)
    end = timezone.datetime(self.year, month, last_day, 23, 59, 59)
    return start, end

def get_accomplished_for_month(self, month):
    """Calculate accomplished inspections for a specific month"""
    from datetime import datetime
    
    # Get month date range
    month_start, month_end = self.get_month_dates(month)
    
    # Count finished inspections (same logic as accomplished property)
    finished_statuses = [
        'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
        'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
        'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
        'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
    ]
    
    # Get all finished inspections in this month
    finished_inspections = Inspection.objects.filter(
        current_status__in=finished_statuses,
        updated_at__range=[month_start, month_end]
    ).prefetch_related('form')
    
    # Count inspections where this law is in their applicable environmental laws
    count = 0
    for inspection in finished_inspections:
        if hasattr(inspection, 'form') and inspection.form:
            checklist = inspection.form.checklist if hasattr(inspection.form, 'checklist') else {}
            general = checklist.get('general', {})
            applicable_laws = general.get('environmental_laws', [])
            
            if self.law in applicable_laws:
                count += 1
    
    return count
```

### 2. Backend API Updates
**File:** `server/inspections/views.py`

Update `get_quotas()` action to calculate month-specific accomplishments:

```python
@action(detail=False, methods=['get'])
def get_quotas(self, request):
    """Get quotas with support for monthly, quarterly, and yearly views"""
    from datetime import datetime
    from .models import ComplianceQuota
    
    user = request.user
    year = int(request.query_params.get('year', datetime.now().year))
    view_mode = request.query_params.get('view_mode', 'monthly')
    
    # Support both month and quarter parameters (month takes precedence)
    month = request.query_params.get('month')
    quarter = request.query_params.get('quarter')
    
    # If month is provided, convert to quarter for DB filtering
    if month:
        month = int(month)
        quarter = ComplianceQuota.get_quarter_from_month(month)
    elif not quarter:
        quarter = ((datetime.now().month - 1) // 3) + 1
    
    quarter = int(quarter)
    
    # Get quotas from database (still by quarter)
    if view_mode == 'yearly':
        quotas = ComplianceQuota.objects.filter(year=year)
    else:
        quotas = ComplianceQuota.objects.filter(year=year, quarter=quarter)
    
    # Apply role-based filtering (existing code)
    # ...
    
    quota_data = []
    for quota in quotas:
        quarter_months = ComplianceQuota.get_months_in_quarter(quota.quarter)
        month_value = month if month else (quarter_months[0] if quarter_months else ((quota.quarter - 1) * 3 + 1))
        
        # Calculate accomplished based on view mode
        if view_mode == 'monthly' and month:
            # For monthly view, calculate accomplishments for specific month only
            accomplished = quota.get_accomplished_for_month(month)
        elif view_mode == 'quarterly':
            # For quarterly view, use quarter total
            accomplished = quota.accomplished
        else:  # yearly view
            # For yearly view, use quarter total (will aggregate per quarter)
            accomplished = quota.accomplished
        
        # Calculate percentage and exceeded status
        percentage = round((accomplished / quota.target * 100), 1) if quota.target > 0 else 0
        exceeded = accomplished > quota.target
        
        quota_data.append({
            'id': quota.id,
            'law': quota.law,
            'year': quota.year,
            'quarter': quota.quarter,
            'month': month_value,
            'target': quota.target,  # Still quarterly target until migration
            'accomplished': accomplished,  # Month-specific when monthly view
            'auto_adjusted': quota.auto_adjusted,
            'percentage': percentage,
            'exceeded': exceeded,
            'created_at': quota.created_at,
            'updated_at': quota.updated_at
        })
    
    return Response(quota_data)
```

### 3. Frontend - No Changes Needed
The frontend already passes the `month` parameter when in monthly view mode. The QuotaCard component will automatically display the month-specific accomplished counts returned from the API.

### 4. Testing Scenarios

1. **Monthly View - January Selected:**
   - Should show accomplishments only from January 1-31
   - Count should be different from February or March

2. **Monthly View - February Selected:**
   - Should show accomplishments only from February 1-28/29
   - Count should be different from January or March

3. **Quarterly View:**
   - Should show total accomplishments for entire quarter (Jan+Feb+Mar)
   - Should match sum of individual months

4. **Yearly View:**
   - Should show accomplishments per quarter
   - Each quarter should show its total accomplishments

5. **Edge Cases:**
   - Leap year (February 29)
   - Month boundaries (ensure no double-counting)
   - Different years (ensure correct year boundaries)

## Expected Behavior After Implementation

### Before (Current):
- Select "January" → Shows Q1 total (Jan + Feb + Mar)
- Select "February" → Shows Q1 total (Jan + Feb + Mar) [SAME]
- Select "March" → Shows Q1 total (Jan + Feb + Mar) [SAME]

### After (Fixed):
- Select "January" → Shows January only accomplishments
- Select "February" → Shows February only accomplishments [DIFFERENT]
- Select "March" → Shows March only accomplishments [DIFFERENT]
- Select "Quarterly" → Shows Q1 total (Jan + Feb + Mar)

## Performance Considerations

1. **Caching:** Consider caching month-specific accomplishments to avoid recalculating on every request
2. **Database Indexes:** Ensure `updated_at` field on Inspection model is indexed for date range queries
3. **Query Optimization:** Use `select_related` and `prefetch_related` to minimize database hits

## Migration Path

This implementation maintains backward compatibility:
- Quotas are still stored by quarter in the database
- API calculates month-specific accomplishments on-the-fly
- When full monthly migration happens, this logic will seamlessly work with monthly-stored quotas

## Files to Modify

1. `server/inspections/models.py` - Add `get_month_dates()` and `get_accomplished_for_month()` methods
2. `server/inspections/views.py` - Update `get_quotas()` to use month-specific calculation

## Estimated Impact

- **Low Risk:** Changes are additive, don't break existing functionality
- **High Value:** Users get accurate month-specific accomplishment counts
- **Backward Compatible:** Quarterly view still works as before

