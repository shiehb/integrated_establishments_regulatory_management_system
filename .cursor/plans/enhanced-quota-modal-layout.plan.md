<!-- Enhanced Monthly Quota with Quarterly Filtering -->
# Enhanced Monthly Quota Modal Layout with Quarterly Filtering

## System Architecture

**Data Model:** Monthly (12 months per year)
**UI Display:** Quarterly filtering and grouping
**Carry-Over Logic:** Month-to-month (not quarter-to-quarter)

## Visual Layout Design

The new modal will have the following structure:

```
┌─────────────────────────────────────────────────────────┐
│  [Gradient Header - Sky Blue]                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🎯 Icon  Set Inspection Quota                    │  │
│  │      Create monthly inspection targets            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 📅 Period Selection                                │ │
│  │ ┌─────────────┬─────────────┬─────────────┐      │ │
│  │ │ Year *       │ Quarter *   │ Month *      │      │ │
│  │ │ [2024 ▼]     │ [Q1 ▼]      │ [Jan ▼]     │      │ │
│  │ └─────────────┴─────────────┴─────────────┘      │ │
│  │ Filter by Quarter, then select specific month     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🏢 Inspection Program                              │ │
│  │ Law *                                              │ │
│  │ [Select Law ▼]                                     │ │
│  │ PD-1586 (Environmental Impact Assessment)          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 📋 Target Settings                                 │ │
│  │ Target Inspections *                               │ │
│  │ [25]  ☑ Auto-adjust next month based on...        │ │
│  │       Carry-over: Shortage adds, Excess subtracts  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 📊 Current Status (if editing)                    │ │
│  │ Accomplished: 15  │  Progress: 60%                │ │
│  │ Carry-over: +2 (will be added to next month)      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [Cancel]              [🎯 Set Target]              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Implementation Plan

### 1. Backend Model Changes - Monthly Storage
**File:** `server/inspections/models.py`

- **Change `quarter` field to `month` field** (IntegerField with choices 1-12)
- Update `unique_together` to use `['law', 'year', 'month']`
- Update `get_quarter_dates()` method to `get_month_dates()` using calendar month ranges
- Update `accomplished` property to filter by month date range instead of quarter
- Update `__str__` method to display month name instead of quarter
- Update indexes to use `month` instead of `quarter`
- Update `auto_adjust_next_quarter()` to `auto_adjust_next_month()` with carry-over logic:
  - **Shortage Logic**: If accomplished < target, add shortage to next month
    - Example: Target 10, Accomplished 8 → Shortage 2 → Next month target = base_target + 2
  - **Excess Logic**: If accomplished > target, subtract excess from next month
    - Example: Target 10, Accomplished 12 → Excess 2 → Next month target = base_target - 2 (minimum 1)
  - **Combined Formula**: `next_target = base_target + (accomplished - target)`
  - Handle year boundary (December → January next year)
- Add method `get_carry_over()` that returns:
  - Positive number = excess (will subtract from next month)
  - Negative number = shortage (will add to next month)
  - Zero = exactly met target
- Add property `carry_over_display()` for formatted string display

### 2. Backend Views Changes - Monthly API with Quarterly Filtering
**File:** `server/inspections/views.py`

- Update `get_quotas()` method:
  - Accept `month` parameter (1-12) for specific month
  - Accept `quarter` parameter (1-4) for filtering - returns all months in that quarter
  - If `quarter` provided, filter months: Q1=[1,2,3], Q2=[4,5,6], Q3=[7,8,9], Q4=[10,11,12]
  - Default to current month if neither specified
  - Return data with `month` field (not `quarter`)
- Update `set_quota()` method:
  - Accept and validate `month` (1-12) instead of `quarter`
  - Remove `quarter` parameter (only use for filtering in get_quotas)
  - Update response data to include `month` field
- Add helper method `get_months_in_quarter(quarter)`:
  - Q1 → [1, 2, 3]
  - Q2 → [4, 5, 6]
  - Q3 → [7, 8, 9]
  - Q4 → [10, 11, 12]
- Update `auto_adjust_quotas` action to use monthly carry-over logic
- Add `carry_over` field to quota response data

### 3. Frontend Constants
**File:** `src/constants/quotaConstants.js`

- Add `MONTHS` constant array with all 12 months:
  ```javascript
  export const MONTHS = [
    { value: 1, label: 'January', short: 'Jan', quarter: 1 },
    { value: 2, label: 'February', short: 'Feb', quarter: 1 },
    { value: 3, label: 'March', short: 'Mar', quarter: 1 },
    { value: 4, label: 'April', short: 'Apr', quarter: 2 },
    // ... all 12 months with quarter mapping
  ];
  ```
- Keep `QUARTERS` constant for filtering:
  ```javascript
  export const QUARTERS = [
    { value: 1, label: 'Q1 (Jan-Mar)', months: [1,2,3] },
    { value: 2, label: 'Q2 (Apr-Jun)', months: [4,5,6] },
    { value: 3, label: 'Q3 (Jul-Sep)', months: [7,8,9] },
    { value: 4, label: 'Q4 (Oct-Dec)', months: [10,11,12] }
  ];
  ```
- Add helper function `getMonthsInQuarter(quarter)` to return month values
- Add helper function `getQuarterFromMonth(month)` to return quarter number
- Add helper function to format carry-over display

### 4. Update QuotaModal Component
**File:** `src/components/dashboard/shared/QuotaModal.jsx`

- Add gradient header section with icon and descriptive subtitle
- **Quarterly Filter + Monthly Selection:**
  - Add quarter filter dropdown (Q1-Q4) - filters available months
  - Add month selector dropdown - shows only months in selected quarter
  - When quarter changes, update available months
  - Default to current quarter and current month
- Form state structure:
  ```javascript
  {
    law: '',
    year: currentYear,
    quarter: currentQuarter,  // For filtering only
    month: currentMonth,        // Actual data storage
    target: '',
    auto_adjust: true
  }
  ```
- Organize form into card-based sections:
  - **Period Selection Card** (Year + Quarter Filter + Month) with Calendar icon
    - Year dropdown
    - Quarter filter dropdown (shows label like "Q1 (Jan-Mar)")
    - Month dropdown (filtered by selected quarter)
    - Info text: "Filter by quarter, then select specific month"
  - **Inspection Program Card** (Law selection with full name display) with Building2 icon
  - **Target Settings Card** (Target input + auto-adjust checkbox) with FileText icon
    - Info box: "Shortage adds to next month, excess subtracts from next month"
  - **Current Status Card** (shown only when editing):
    - Accomplished count
    - Progress percentage
    - Carry-over display (e.g., "+2 (will be added to next month)")
- Update `getAvailableMonths()` function:
  - Filter by selected quarter first
  - Then filter by year (current year: future months, next year: all months)
- Update confirmation dialog to show quarter context and month name
- Increase max-width from `max-w-md` to `max-w-2xl`
- Add visual improvements: gradient header, card backgrounds, better spacing

### 5. Update QuotaCard Component
**File:** `src/components/dashboard/shared/QuotaCard.jsx`

- **Quarterly Filter View:**
  - Keep quarter selector for filtering (Q1-Q4)
  - When quarter selected, fetch and display all months in that quarter
  - Display as grouped view: Show all 3 months of selected quarter together
  - Each month shows its own quota card
- Update state structure:
  - `selectedYear` and `selectedQuarter` (for filtering)
  - Fetch quotas for all months in selected quarter
- Update display:
  - Header shows: "Q1 2024 (January - March)" or "Q2 2024 (April - June)"
  - Display 3 quota cards side-by-side (one per month)
  - Or display as a table with columns: Month | Law | Target | Accomplished | Progress
- Update `useQuotaData` hook calls:
  - Pass `quarter` parameter for filtering
  - API returns all months in that quarter
- Update period badge logic based on month comparison
- Add carry-over indicators per month

### 6. Update useQuotaData Hook
**File:** `src/components/dashboard/shared/useQuotaData.js`

- Update to accept both `quarter` (for filtering) and `month` (for specific quota)
- API call structure:
  - If `quarter` provided: `GET /api/quotas?year=2024&quarter=1` → returns months 1,2,3
  - If `month` provided: `GET /api/quotas?year=2024&month=1` → returns single month
- Update hook parameters to accept `quarter` for filtering
- Handle response data with `month` field
- Group quotas by month for display

### 7. Visual Improvements (Modal)
- Header: Gradient background (from-sky-600 to-sky-700) with white text and icon badge
- Cards: Light gray background (gray-50) with borders (border-gray-200) for visual separation
- Icons: Add contextual icons to each section header (Calendar, Building2, FileText from lucide-react)
- Typography: Improve font weights (semibold for headers) and sizes for better readability
- Spacing: Increase padding (p-6) and margins (space-y-6) for better breathing room
- Max width: Increase from `max-w-md` to `max-w-2xl` for better layout
- Quarter filter: Highlighted styling to show it's a filter, not data storage

### 8. Enhanced Features
- Show full law name below law selection when a law is selected
- Improve current status display with side-by-side metrics (Accomplished | Progress) when editing
- Display carry-over information prominently (month-to-month)
- Quarterly filter indicator: Show which quarter is being filtered
- Month selector filtered by quarter: Only show months in selected quarter
- Better error message styling with AlertCircle icons
- Enhanced confirmation dialog showing quarter context and month name

### 9. Database Migration
- Create migration file: `python manage.py makemigrations inspections`
- Migration will:
  - Add new `month` field to ComplianceQuota model (nullable initially)
  - Migrate existing quarter data to months:
    - Option 1: Q1→January only, Q2→April only, etc. (one month per quarter)
    - Option 2: Q1→Create quotas for Jan, Feb, Mar (all 3 months)
    - Recommendation: Option 2 - create all 3 months per quarter
  - Remove `quarter` field after migration
  - Update indexes and constraints to use `month`
- Run migration: `python manage.py migrate`
- Add data migration script to handle existing quarterly quotas

### 10. Carry-Over Logic Implementation Details

**Monthly Carry-Over Calculation:**
1. At end of month, calculate: `carry_over = accomplished - target`
2. When auto-adjusting next month:
   - Get next month's base target (from existing quota or default)
   - Apply carry-over: `new_target = base_target + carry_over`
   - Ensure minimum: `new_target = max(1, new_target)`
   - Handle year boundary: December → January next year

**User Scenarios:**
- Scenario 1: January Target 10, Accomplished 8
  - Carry-over: -2 (shortage)
  - February: If base is 10, new target = 10 + (-2) = 8
  - Display: "Shortage of 2 will be added to February"
  
- Scenario 2: January Target 10, Accomplished 12
  - Carry-over: +2 (excess)
  - February: If base is 10, new target = 10 + 2 = 12
  - Display: "Excess of 2 will be subtracted from February"
  
- Scenario 3: December Target 10, Accomplished 8
  - Carry-over: -2 (shortage)
  - January (next year): If base is 10, new target = 10 + (-2) = 8
  - Display: "Shortage of 2 will be added to January 2025"

### 11. Quarterly Filtering Logic

**Filter Behavior:**
- User selects Quarter (Q1-Q4) to filter months
- Month dropdown shows only months in selected quarter:
  - Q1 → January, February, March
  - Q2 → April, May, June
  - Q3 → July, August, September
  - Q4 → October, November, December
- When quarter changes, month dropdown updates
- When viewing quotas, filter by quarter shows all months in that quarter
- Each month maintains independent quota data

**API Filtering:**
- `GET /api/quotas?year=2024&quarter=1` → Returns quotas for months 1, 2, 3
- `GET /api/quotas?year=2024&month=1` → Returns quota for January only
- Backend converts quarter to month list: `[1,2,3]` for Q1

### 12. Recommendations & Best Practices

**Backend API Enhancements:**
- Add `get_months_in_quarter()` helper function
- Add `bulk_create_quotas()` endpoint for creating multiple months at once
- Validate quarter-to-month conversion
- Handle edge cases (year boundaries, quarter transitions)
- Add logging for carry-over calculations

**Frontend UX Improvements:**
- Show quarter context clearly ("Filtering Q1 2024")
- Display month name prominently in quota cards
- Group monthly quotas by quarter in dashboard view
- Add "View All Months" option to see entire year
- Show quarter summary (total target, total accomplished across 3 months)

**Data Consistency:**
- Ensure carry-over applies month-to-month, not quarter-to-quarter
- Validate that month data is stored correctly (not quarter)
- Add data integrity checks
- Consider adding migration validation script

**Testing Recommendations:**
- Test monthly storage with quarterly filtering
- Test carry-over across month boundaries
- Test carry-over across year boundary (Dec → Jan)
- Test quarter filtering (all 3 months display correctly)
- Test edge cases (first month, last month, year boundaries)
- Test bulk creation for multiple months in a quarter

**Performance Considerations:**
- Efficiently fetch all months in a quarter (single query)
- Cache quarter-to-month mappings
- Optimize queries for monthly data with quarterly views
- Consider pagination if displaying many months

**User Experience:**
- Clear indication that data is stored monthly but viewed quarterly
- Intuitive quarter filter that updates month options
- Visual grouping of months by quarter in dashboard
- Tooltips explaining monthly carry-over vs quarterly view