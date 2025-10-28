import React, { useState, useEffect } from 'react';
import { Bell, Calendar, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { getReinspectionReminders } from '../../services/api';

const ReinspectionReminders = () => {
  const [allReminders, setAllReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overdue');

  useEffect(() => {
    fetchReinspectionReminders();
  }, []);

  const fetchReinspectionReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getReinspectionReminders();
      console.log('Reinspection reminders API response:', data);
      console.log('Number of reminders:', data?.length);
      
      // Set reminders
      setAllReminders(data || []);
      
      // Log detailed info
      if (data && data.length > 0) {
        console.log('Sample reminder:', data[0]);
      } else {
        console.log('No reminders found. This is normal if no inspections have been closed yet.');
      }
    } catch (error) {
      console.error('Failed to fetch reinspection reminders:', error);
      console.error('Error details:', error.response);
      if (error.response?.status === 403) {
        setError('Access denied. Only Division Chiefs can view reinspection reminders.');
      } else {
        setError(error.message || 'Failed to fetch reinspection reminders');
      }
    } finally {
      setLoading(false);
    }
  };

  // Categorize reminders by time periods
  const categorizeReminders = () => {
    const categories = {
      overdue: [],
      thisMonth: [],
      next3Months: [],
      next6Months: [],
      next12Months: [],
      beyond12Months: []
    };

    allReminders.forEach(reminder => {
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
  };

  const getUrgencyColor = (daysUntilDue) => {
    if (daysUntilDue <= 0) return 'text-red-600 bg-red-100 border-red-300';
    if (daysUntilDue <= 7) return 'text-orange-600 bg-orange-100 border-orange-300';
    if (daysUntilDue <= 30) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-blue-600 bg-blue-100 border-blue-300';
  };

  const getUrgencyIcon = (daysUntilDue) => {
    if (daysUntilDue <= 0) return <AlertTriangle className="h-5 w-5" />;
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

  const getTabCount = (category) => {
    const categories = categorizeReminders();
    return categories[category].length;
  };

  const getTabIcon = (tabName) => {
    switch (tabName) {
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'thisMonth': return <Clock className="h-4 w-4" />;
      case 'next3Months': return <Calendar className="h-4 w-4" />;
      case 'next6Months': return <Calendar className="h-4 w-4" />;
      case 'next12Months': return <Calendar className="h-4 w-4" />;
      case 'beyond12Months': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const renderRemindersList = (reminders) => {
    if (!reminders || reminders.length === 0) {
      return (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No reinspection reminders in this period</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`p-4 rounded-lg border-l-4 ${getUrgencyColor(reminder.days_until_due)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {getUrgencyIcon(reminder.days_until_due)}
                  <h4 className="ml-2 font-medium text-gray-900">{reminder.establishment_name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Address:</span> {reminder.establishment_address}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Original Inspection:</span> {reminder.original_inspection_code}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Compliance Status:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                    reminder.compliance_status === 'COMPLIANT' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {reminder.compliance_status === 'COMPLIANT' ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </p>
                <p className="text-sm font-medium text-gray-900">
                  <span className="font-medium">Due Date:</span> {formatDate(reminder.due_date)}
                </p>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(reminder.days_until_due)}`}>
                  {getUrgencyText(reminder.days_until_due)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {reminder.days_until_due === 0 ? 'Today' : 
                   reminder.days_until_due < 0 ? `${Math.abs(reminder.days_until_due)} days overdue` :
                   `${reminder.days_until_due} days`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Reinspection Reminders</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Reinspection Reminders</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Error Loading Reminders</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={fetchReinspectionReminders}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categories = categorizeReminders();
  const tabs = [
    { key: 'overdue', label: 'Overdue', count: getTabCount('overdue') },
    { key: 'thisMonth', label: 'This Month', count: getTabCount('thisMonth') },
    { key: 'next3Months', label: 'Next 3 Months', count: getTabCount('next3Months') },
    { key: 'next6Months', label: 'Next 6 Months', count: getTabCount('next6Months') },
    { key: 'next12Months', label: 'Next 12 Months', count: getTabCount('next12Months') },
    { key: 'beyond12Months', label: 'Beyond 12 Months', count: getTabCount('beyond12Months') }
  ];

  // Ensure activeTab exists in categories
  const currentCategory = categories[activeTab] || [];

  // Show empty state if no reminders at all
  if (!loading && !error && allReminders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Reinspection Reminders</h3>
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                0 Total
              </span>
            </div>
            <button
              onClick={fetchReinspectionReminders}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>
        <div className="p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Reinspection Schedules</h4>
          <p className="text-gray-500 max-w-md mx-auto">
            There are currently no reinspection schedules in the system. 
            Schedules will be automatically created when inspections are completed with status "Closed - Compliant" or "Closed - Non-Compliant".
          </p>
          <div className="mt-6 text-sm text-gray-400">
            <p>• Non-compliant establishments: 1 year reinspection</p>
            <p>• Compliant establishments: 2-3 years reinspection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Reinspection Reminders</h3>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {allReminders.length} Total
            </span>
          </div>
          <button
            onClick={fetchReinspectionReminders}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getTabIcon(tab.key)}
              <span className="ml-2">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderRemindersList(currentCategory)}
      </div>
    </div>
  );
};

export default ReinspectionReminders;