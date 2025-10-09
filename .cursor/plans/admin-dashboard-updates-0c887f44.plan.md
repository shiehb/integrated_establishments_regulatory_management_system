<!-- 0c887f44-3621-4f1f-a409-ca3c1051cd54 11dfbc98-4d45-4a6e-b977-7d2fd7b9d05a -->
# Fix Compliance Status & Add Quarterly Comparison

## 🔍 Issues Identified

### Backend Analysis:
1. **Inspection Status Model**: Uses complex workflow states (SECTION_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT, CLOSED_COMPLIANT, CLOSED_NON_COMPLIANT, etc.)
2. **Compliance Decision**: Stored in `InspectionForm.compliance_decision` field (PENDING, COMPLIANT, NON_COMPLIANT, PARTIALLY_COMPLIANT)
3. **Current Frontend Issue**: Using old status values (COMPLETED, APPROVED, REJECTED) that don't match backend

### Solution:
1. Create new backend API endpoint for compliance statistics
2. Update frontend to use correct backend status mapping
3. Add quarterly comparison API endpoint
4. Implement Card 4 with quarterly comparison visualization

## 📋 Implementation Steps

### 1. Backend - Create Compliance Statistics API

**File: `server/inspections/views.py`**

Add new action to `InspectionViewSet`:

```python
@action(detail=False, methods=['get'])
def compliance_stats(self, request):
    """
    Get compliance statistics with quarterly filtering
    """
    from datetime import datetime, timedelta
    from django.db.models import Count, Q
    
    # Get query parameters
    quarter = request.query_params.get('quarter')  # e.g., 'Q1', 'Q2', 'Q3', 'Q4'
    year = request.query_params.get('year', datetime.now().year)
    
    queryset = Inspection.objects.all()
    
    # Filter by quarter if specified
    if quarter and year:
        quarter_map = {
            'Q1': (1, 3), 'Q2': (4, 6), 
            'Q3': (7, 9), 'Q4': (10, 12)
        }
        start_month, end_month = quarter_map.get(quarter, (1, 12))
        queryset = queryset.filter(
            created_at__year=year,
            created_at__month__gte=start_month,
            created_at__month__lte=end_month
        )
    
    # Count by compliance status
    pending = queryset.filter(
        Q(current_status__in=[
            'CREATED', 'SECTION_ASSIGNED', 'SECTION_IN_PROGRESS',
            'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS',
            'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS',
            'UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED',
            'LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT'
        ])
    ).count()
    
    compliant = queryset.filter(
        Q(current_status__in=[
            'SECTION_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_COMPLIANT',
            'MONITORING_COMPLETED_COMPLIANT', 'CLOSED_COMPLIANT'
        ])
    ).count()
    
    non_compliant = queryset.filter(
        Q(current_status__in=[
            'SECTION_COMPLETED_NON_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
            'MONITORING_COMPLETED_NON_COMPLIANT', 'CLOSED_NON_COMPLIANT'
        ])
    ).count()
    
    total = compliant + non_compliant
    
    return Response({
        'pending': pending,
        'compliant': compliant,
        'non_compliant': non_compliant,
        'total': total,
        'compliance_rate': round((compliant / total * 100), 1) if total > 0 else 0
    })

@action(detail=False, methods=['get'])
def quarterly_comparison(self, request):
    """
    Compare current quarter vs last quarter finished inspections
    """
    from datetime import datetime
    from django.db.models import Q
    
    now = datetime.now()
    current_year = now.year
    current_quarter = (now.month - 1) // 3 + 1
    
    # Calculate last quarter
    if current_quarter == 1:
        last_quarter = 4
        last_year = current_year - 1
    else:
        last_quarter = current_quarter - 1
        last_year = current_year
    
    quarter_map = {
        1: (1, 3), 2: (4, 6), 3: (7, 9), 4: (10, 12)
    }
    
    # Current quarter finished inspections
    curr_start, curr_end = quarter_map[current_quarter]
    current_finished = Inspection.objects.filter(
        Q(current_status__in=[
            'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
            'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
            'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
            'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
        ]),
        created_at__year=current_year,
        created_at__month__gte=curr_start,
        created_at__month__lte=curr_end
    ).count()
    
    # Last quarter finished inspections
    last_start, last_end = quarter_map[last_quarter]
    last_finished = Inspection.objects.filter(
        Q(current_status__in=[
            'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
            'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
            'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
            'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
        ]),
        created_at__year=last_year,
        created_at__month__gte=last_start,
        created_at__month__lte=last_end
    ).count()
    
    # Calculate percentage change
    if last_finished > 0:
        change_percentage = round(((current_finished - last_finished) / last_finished * 100), 1)
    else:
        change_percentage = 100 if current_finished > 0 else 0
    
    return Response({
        'current_quarter': {
            'quarter': f'Q{current_quarter}',
            'year': current_year,
            'finished': current_finished
        },
        'last_quarter': {
            'quarter': f'Q{last_quarter}',
            'year': last_year,
            'finished': last_finished
        },
        'change_percentage': change_percentage,
        'trend': 'up' if change_percentage > 0 else 'down' if change_percentage < 0 else 'stable'
    })
```

### 2. Frontend - Update API Service

**File: `src/services/api.js`**

Add new API functions:

```javascript
// Get compliance statistics
export const getComplianceStats = async (params = {}) => {
  try {
    const response = await api.get('/inspections/inspections/compliance_stats/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching compliance stats:', error);
    throw error;
  }
};

// Get quarterly comparison
export const getQuarterlyComparison = async () => {
  try {
    const response = await api.get('/inspections/inspections/quarterly_comparison/');
    return response.data;
  } catch (error) {
    console.error('Error fetching quarterly comparison:', error);
    throw error;
  }
};
```

### 3. Frontend - Update AdminDashboard

**File: `src/components/dashboard/AdminDashboard.jsx`**

#### 3.1 Update imports and add new state:

```javascript
import { getComplianceStats, getQuarterlyComparison } from "../../services/api";

// Add new state for quarterly data
const [quarterlyData, setQuarterlyData] = useState({
  current_quarter: { quarter: '', year: 0, finished: 0 },
  last_quarter: { quarter: '', year: 0, finished: 0 },
  change_percentage: 0,
  trend: 'stable'
});
```

#### 3.2 Replace compliance calculation with API call:

```javascript
// Remove the old useMemo compliance calculation
// Replace with API fetch
const fetchComplianceStats = async () => {
  try {
    const data = await getComplianceStats();
    setComplianceStats({
      compliant: data.compliant,
      nonCompliant: data.non_compliant,
      pending: data.pending,
      total: data.total
    });
  } catch (error) {
    console.error('Error fetching compliance stats:', error);
  }
};

const fetchQuarterlyComparison = async () => {
  try {
    const data = await getQuarterlyComparison();
    setQuarterlyData(data);
  } catch (error) {
    console.error('Error fetching quarterly comparison:', error);
  }
};

useEffect(() => {
  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchEstablishments(),
        fetchInspections(),
        fetchActivityLogs(),
        fetchComplianceStats(),  // Add this
        fetchQuarterlyComparison()  // Add this
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  initializeDashboard();
}, []);
```

#### 3.3 Create new QuarterlyComparisonCard component:

```javascript
const QuarterlyComparisonCard = ({ data, isLoading }) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const { current_quarter, last_quarter, change_percentage, trend } = data;

  return (
    <div className="bg-white border rounded-lg p-2 transition-all duration-300 hover:shadow-lg border-sky-200 bg-sky-50 group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp size={20} className="text-sky-600" />
          Quarterly Progress
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Current Quarter */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">
            {current_quarter.quarter} {current_quarter.year}
          </div>
          <div className="text-3xl font-bold text-sky-700">
            {current_quarter.finished}
          </div>
          <div className="text-xs text-gray-600">Finished Inspections</div>
        </div>

        {/* vs Separator */}
        <div className="border-t border-sky-200 my-2"></div>

        {/* Last Quarter */}
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">
            {last_quarter.quarter} {last_quarter.year}
          </div>
          <div className="text-xl font-semibold text-gray-600">
            {last_quarter.finished}
          </div>
        </div>

        {/* Change Indicator */}
        <div className={`flex items-center gap-1 text-sm font-medium ${
          trend === 'up' ? 'text-green-600' :
          trend === 'down' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          <span>{Math.abs(change_percentage)}%</span>
          <span className="text-xs text-gray-500">
            {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'no change'}
          </span>
        </div>
      </div>
    </div>
  );
};
```

#### 3.4 Update Card 4 in the grid:

```javascript
{/* Cell 4: Quarterly Comparison */}
<div className="col-start-2 row-start-2">
  <QuarterlyComparisonCard
    data={quarterlyData}
    isLoading={isLoading}
  />
</div>
```

### 4. Update ComplianceCard to use API data

Update the `complianceData` to use the fetched stats directly instead of calculating from inspections:

```javascript
const complianceData = useMemo(() => {
  return {
    labels: ['Compliant', 'Non-Compliant'],
    datasets: [
      {
        data: [complianceStats.compliant, complianceStats.nonCompliant],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2,
      },
    ],
  };
}, [complianceStats]);
```

## 🎯 Expected Results

### Compliance Status Card:
- ✅ Shows accurate pending count from backend
- ✅ Shows accurate compliant count (all compliant statuses)
- ✅ Shows accurate non-compliant count (all non-compliant statuses)
- ✅ Calculates correct compliance rate

### Quarterly Comparison Card (Card 4):
- ✅ Shows current quarter finished inspections
- ✅ Shows last quarter finished inspections
- ✅ Displays percentage change with trend indicator
- ✅ Color-coded (green ↑, red ↓, gray →)

## ✅ Testing Checklist

- [ ] Test compliance stats API endpoint
- [ ] Test quarterly comparison API endpoint
- [ ] Verify compliance chart displays correctly
- [ ] Verify quarterly card shows correct data
- [ ] Test with different quarters and years
- [ ] Verify loading states work properly

### To-dos

- [ ] Add compliance_stats action to InspectionViewSet
- [ ] Add quarterly_comparison action to InspectionViewSet
- [ ] Add getComplianceStats and getQuarterlyComparison to api.js
- [ ] Add quarterlyData state and fetch functions to AdminDashboard
- [ ] Create QuarterlyComparisonCard component
- [ ] Update ComplianceCard to use API data
- [ ] Test both endpoints and verify data display