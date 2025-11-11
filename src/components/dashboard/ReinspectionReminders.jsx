import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Bell, Calendar, AlertTriangle, RefreshCw, Clock, Filter } from 'lucide-react';
import { getReinspectionReminders } from '../../services/api';
import TableToolbar from '../common/TableToolbar';

const complianceOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'COMPLIANT', label: 'Compliant' },
  { value: 'NON_COMPLIANT', label: 'Non-Compliant' }
];

const ReinspectionReminders = () => {
  const [allReminders, setAllReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overdue');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchReinspectionReminders();
  }, []);

  const fetchReinspectionReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReinspectionReminders();
      setAllReminders(data || []);
    } catch (error) {
      console.error('Failed to fetch reinspection reminders:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Only Division Chiefs can view reinspection reminders.');
      } else {
        setError(error.message || 'Failed to fetch reinspection reminders');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReinspectionReminders();
  };

  const filteredReminders = useMemo(() => {
    return allReminders.filter((reminder) => {
      const matchesSearch =
        !searchQuery ||
        reminder.establishment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.original_inspection_code?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : reminder.compliance_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allReminders, searchQuery, statusFilter]);

  const categorizeReminders = useCallback((reminders = filteredReminders) => {
    const categories = {
      overdue: [],
      thisMonth: [],
      next3Months: [],
      next6Months: [],
      next12Months: [],
      beyond12Months: []
    };

    reminders.forEach((reminder) => {
      const daysUntilDue = reminder.days_until_due;

      if (daysUntilDue < 0) {
        categories.overdue.push(reminder);
      } else if (daysUntilDue <= 30) {
        categories.thisMonth.push(reminder);
      } else if (daysUntilDue <= 90) {
        categories.next3Months.push(reminder);
      } else if (daysUntilDue <= 180) {
        categories.next6Months.push(reminder);
      } else if (daysUntilDue <= 365) {
        categories.next12Months.push(reminder);
      } else {
        categories.beyond12Months.push(reminder);
      }
    });

    return categories;
  }, [filteredReminders]);

  const categories = categorizeReminders();
  const tabs = [
    { key: 'overdue', label: 'Overdue', count: categories.overdue.length },
    { key: 'thisMonth', label: 'This Month', count: categories.thisMonth.length },
    { key: 'next3Months', label: 'Next 3 Months', count: categories.next3Months.length },
    { key: 'next6Months', label: 'Next 6 Months', count: categories.next6Months.length },
    { key: 'next12Months', label: 'Next 12 Months', count: categories.next12Months.length },
    { key: 'beyond12Months', label: 'Beyond 12 Months', count: categories.beyond12Months.length }
  ];

  const currentCategory = categories[activeTab] || [];

  const getUrgencyColor = (daysUntilDue) => {
    if (daysUntilDue <= 0) return 'text-red-600 bg-red-100 border-red-300';
    if (daysUntilDue <= 7) return 'text-orange-600 bg-orange-100 border-orange-300';
    if (daysUntilDue <= 30) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-blue-600 bg-blue-100 border-blue-300';
  };

  const getUrgencyIcon = (daysUntilDue) => {
    if (daysUntilDue <= 7) return <AlertTriangle className="h-5 w-5" />;
    return <Calendar className="h-5 w-5" />;
  };

  const getUrgencyText = (daysUntilDue) => {
    if (daysUntilDue < 0) return 'Overdue';
    if (daysUntilDue === 0) return 'Due Today';
    if (daysUntilDue <= 7) return 'Due Soon';
    return 'Upcoming';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filterSidebar = (
    filterPanelOpen && (
      <div className="absolute right-0 z-20 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Filters</span>
            {(statusFilter !== 'all') && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs text-sky-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Compliance Status
            </span>
            {complianceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setFilterPanelOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  statusFilter === option.value
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{option.label}</span>
                {statusFilter === option.value && (
                  <span className="w-2 h-2 bg-sky-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  );

  const renderLoadingState = () => (
    <tbody>
      {Array.from({ length: 5 }).map((_, idx) => (
        <tr key={idx} className="border-b border-gray-200 animate-pulse">
          <td className="px-4 py-3">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </td>
          <td className="px-4 py-3">
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </td>
          <td className="px-4 py-3 text-center">
            <div className="mx-auto h-3 bg-gray-200 rounded w-16" />
          </td>
          <td className="px-4 py-3 text-center">
            <div className="mx-auto h-3 bg-gray-200 rounded w-12" />
          </td>
          <td className="px-4 py-3 text-center">
            <div className="mx-auto h-3 bg-gray-200 rounded w-20" />
          </td>
        </tr>
      ))}
    </tbody>
  );

  const renderEmptyState = (message, icon = Calendar) => (
    <tbody>
      <tr>
        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
          <div className="flex flex-col items-center gap-3">
            {React.createElement(icon, { className: 'h-12 w-12 text-gray-300' })}
            <p className="text-sm">{message}</p>
          </div>
        </td>
      </tr>
    </tbody>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Reinspection Reminders Management</h2>
            <p className="text-sm text-gray-500">Monitor upcoming and overdue reinspections</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={() => setSearchQuery('')}
          searchPlaceholder="Search establishments or inspection code..."
          typeFilterValue={statusFilter}
          typeFilterOptions={complianceOptions}
          onTypeFilterChange={(value) => {
            setStatusFilter(value);
            setActiveTab('overdue');
          }}
          onFilterClick={() => setFilterPanelOpen(!filterPanelOpen)}
          customFilterDropdown={filterSidebar}
          filterOpen={filterPanelOpen}
          onFilterClose={() => setFilterPanelOpen(false)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          additionalActions={[
            {
              onClick: () => setActiveTab('overdue'),
              icon: Filter,
              text: 'Reset Tabs'
            }
          ]}
        />
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap items-center gap-2 px-6 py-3 text-sm font-medium text-gray-600">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {tab.key === 'overdue' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.key ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-sky-600 to-sky-700 text-white text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Establishment</th>
              <th className="px-4 py-3">Inspection Code</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-center">Days Remaining</th>
              <th className="px-4 py-3 text-center">Compliance Status</th>
              <th className="px-4 py-3 text-center">Urgency</th>
            </tr>
          </thead>
          {loading && renderLoadingState()}
          {!loading && error && renderEmptyState(error, AlertTriangle)}
          {!loading && !error && currentCategory.length === 0 && renderEmptyState('No reinspection reminders in this period.')}
          {!loading && !error && currentCategory.length > 0 && (
            <tbody className="divide-y divide-gray-200">
              {currentCategory.map((reminder) => (
                <tr key={reminder.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{reminder.establishment_name}</div>
                    <div className="text-xs text-gray-500">{reminder.establishment_address}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{reminder.original_inspection_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(reminder.due_date)}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    {reminder.days_until_due === 0
                      ? 'Today'
                      : reminder.days_until_due < 0
                        ? `${Math.abs(reminder.days_until_due)} overdue`
                        : `${reminder.days_until_due} days`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        reminder.compliance_status === 'COMPLIANT'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {reminder.compliance_status === 'COMPLIANT' ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(reminder.days_until_due)}`}
                    >
                      {getUrgencyIcon(reminder.days_until_due)}
                      {getUrgencyText(reminder.days_until_due)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default ReinspectionReminders;