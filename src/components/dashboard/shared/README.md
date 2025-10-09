# Shared Dashboard Components

This directory contains reusable dashboard components that can be used across different dashboard types (Admin, Division Chief, Unit Head, etc.).

## Components

### LoadingSkeleton
A loading placeholder component that shows animated skeleton while data is being fetched.

**Usage:**
```jsx
<LoadingSkeleton />
```

### SummaryCard
A reusable summary card for displaying key metrics with hover effects and optional quick actions.

**Props:**
- `title` (string): Card title
- `value` (number|string): Main value to display
- `icon` (React.ReactNode): Icon component
- `color` (string): CSS classes for styling
- `route` (string): Navigation route
- `quickAction` (object, optional): Quick action configuration
- `isLoading` (boolean): Show loading state
- `onNavigate` (function): Navigation handler

**Usage:**
```jsx
<SummaryCard
  title="Users"
  value={150}
  icon={<Users size={24} className="text-blue-600" />}
  color="bg-blue-50 border-blue-200"
  route="/users"
  quickAction={{
    icon: <Plus size={16} />,
    route: "/users/add",
    tooltip: "Add New User"
  }}
  isLoading={false}
  onNavigate={handleNavigate}
/>
```

### ComplianceCard
Displays compliance status with a pie chart showing pending, compliant, and non-compliant inspections.

**Props:**
- `stats` (object): Compliance statistics
- `chartData` (object): Chart.js data for pie chart
- `isLoading` (boolean): Show loading state
- `onViewAll` (function): Handler for view all button

**Usage:**
```jsx
<ComplianceCard
  stats={{
    pending: 15,
    compliant: 7,
    nonCompliant: 2,
    total: 9
  }}
  chartData={complianceChartData}
  isLoading={false}
  onViewAll={handleViewAll}
/>
```

### QuarterlyComparisonCard
Shows quarterly trend comparison with compliance breakdown.

**Props:**
- `data` (object): Quarterly comparison data
- `isLoading` (boolean): Show loading state
- `onRefresh` (function): Handler for refresh button

**Usage:**
```jsx
<QuarterlyComparisonCard
  data={{
    current_quarter: {
      quarter: "Apr-Jun",
      year: 2025,
      compliant: 7,
      non_compliant: 2,
      total_finished: 9
    },
    last_quarter: {
      quarter: "Jan-Mar",
      year: 2025,
      compliant: 0,
      non_compliant: 0,
      total_finished: 0
    },
    change_percentage: 100.0,
    trend: "up"
  }}
  isLoading={false}
  onRefresh={handleRefresh}
/>
```

## Hooks

### useDashboardData
A custom hook that fetches and manages dashboard data with optional role-based filtering.

**Parameters:**
- `userRole` (string, optional): User role for filtering data

**Returns:**
- `isLoading` (boolean): Loading state
- `stats` (object): Basic statistics
- `complianceStats` (object): Compliance statistics
- `quarterlyData` (object): Quarterly comparison data
- `refetch` (function): Function to refresh all data

**Usage:**
```jsx
// For admin (sees all data)
const { isLoading, stats, complianceStats, quarterlyData, refetch } = useDashboardData();

// For role-specific data
const { isLoading, stats, complianceStats, quarterlyData, refetch } = useDashboardData('Division Chief');
```

### useComplianceChart
Generates Chart.js data for the compliance pie chart.

**Parameters:**
- `complianceStats` (object): Compliance statistics object

**Returns:**
- Chart.js data object for pie chart

**Usage:**
```jsx
const complianceData = useComplianceChart(complianceStats);
```

## Role-Based Filtering

Components support role-based data filtering. When a user role is provided to `useDashboardData`, the API calls will include role-specific parameters:

- **Admin**: No role parameter - sees all data
- **Division Chief**: `{ role: 'Division Chief' }` - sees division-specific data
- **Unit Head**: `{ role: 'Unit Head' }` - sees unit-specific data
- **Section Chief**: `{ role: 'Section Chief' }` - sees section-specific data
- **Monitoring Personnel**: `{ role: 'Monitoring Personnel' }` - sees assigned data
- **Legal Unit**: `{ role: 'Legal Unit' }` - sees legal review data

## Extending to Other Dashboards

To use these components in other dashboards:

1. Import the components and hooks:
```jsx
import { useDashboardData } from './shared/useDashboardData';
import { useComplianceChart } from './shared/useComplianceChart';
import SummaryCard from './shared/SummaryCard';
import ComplianceCard from './shared/ComplianceCard';
import QuarterlyComparisonCard from './shared/QuarterlyComparisonCard';
```

2. Use the hooks for data management:
```jsx
const { isLoading, stats, complianceStats, quarterlyData, refetch } = useDashboardData('Your Role');
const complianceData = useComplianceChart(complianceStats);
```

3. Add the components to your layout:
```jsx
<SummaryCard
  title="Your Metric"
  value={stats.yourMetric}
  icon={<YourIcon />}
  color="bg-your-color border-your-color"
  route="/your-route"
  isLoading={isLoading}
  onNavigate={handleNavigate}
/>
```

## Color Scheme

The components use a sky blue color scheme:
- **Primary**: `sky-600`, `sky-700`, `sky-800`
- **Background**: `sky-50`
- **Borders**: `sky-200`
- **Accents**: Various sky blue shades

## API Requirements

The components expect these API endpoints to support role-based filtering:
- `GET /api/auth/list/` - Users list
- `GET /api/establishments/` - Establishments list
- `GET /api/inspections/` - Inspections list
- `GET /api/inspections/compliance_stats/` - Compliance statistics
- `GET /api/inspections/quarterly_comparison/` - Quarterly comparison data

All endpoints should accept an optional `role` parameter for filtering.
