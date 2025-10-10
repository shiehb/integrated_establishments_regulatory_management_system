import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import LoadingSkeleton from './shared/LoadingSkeleton';

export default function InspectionDashboard({ userLevel, userProfile, onNavigate }) {
  const [stats, setStats] = useState({
    totalInspections: 0,
    pendingInspections: 0,
    completedInspections: 0,
    nonCompliantInspections: 0,
    assignedInspections: 0,
    overdueInspections: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [userLevel, userProfile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tab counts for the user
      const response = await fetch('/api/inspections/tab_counts/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalInspections: Object.values(data.tab_counts).reduce((sum, count) => sum + count, 0),
          pendingInspections: data.tab_counts.created_inspections || data.tab_counts.received_from_section || 0,
          completedInspections: data.tab_counts.my_inspections || 0,
          nonCompliantInspections: data.tab_counts.legal_review || 0,
          assignedInspections: data.tab_counts.assigned_inspections || 0,
          overdueInspections: 0 // TODO: Implement overdue logic
        });
      }

      // Fetch recent activity (simplified for now)
      setRecentActivity([
        {
          id: 1,
          type: 'inspection_completed',
          message: 'Inspection EIA-2025-0001 completed - Compliant',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          user: 'John Doe'
        },
        {
          id: 2,
          type: 'inspection_forwarded',
          message: 'Inspection TOX-2025-0002 forwarded to monitoring',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          user: 'Jane Smith'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => {
    const actions = [];

    switch (userLevel) {
      case 'Division Chief':
        actions.push(
          {
            title: 'Create New Inspection',
            description: 'Create a new inspection assignment',
            icon: FileText,
            color: 'bg-blue-500',
            action: () => onNavigate('create')
          },
          {
            title: 'Review Completed',
            description: 'Review completed inspections',
            icon: CheckCircle,
            color: 'bg-green-500',
            action: () => onNavigate('completed')
          }
        );
        break;

      case 'Section Chief':
        actions.push(
          {
            title: 'Created Inspections',
            description: 'Review new inspections from Division Chief',
            icon: FileText,
            color: 'bg-blue-500',
            action: () => onNavigate('created_inspections')
          },
          {
            title: 'My Inspections',
            description: 'Continue working on your inspections',
            icon: Clock,
            color: 'bg-yellow-500',
            action: () => onNavigate('my_inspections')
          },
          {
            title: 'Forwarded List',
            description: 'Track forwarded inspections',
            icon: Users,
            color: 'bg-purple-500',
            action: () => onNavigate('forwarded_list')
          }
        );
        break;

      case 'Unit Head':
        actions.push(
          {
            title: 'Received from Section',
            description: 'Review inspections from Section Chief',
            icon: FileText,
            color: 'bg-blue-500',
            action: () => onNavigate('received_from_section')
          },
          {
            title: 'My Inspections',
            description: 'Continue working on your inspections',
            icon: Clock,
            color: 'bg-yellow-500',
            action: () => onNavigate('my_inspections')
          },
          {
            title: 'Forwarded List',
            description: 'Track inspections forwarded to monitoring',
            icon: Users,
            color: 'bg-purple-500',
            action: () => onNavigate('forwarded_list')
          }
        );
        break;

      case 'Monitoring Personnel':
        actions.push(
          {
            title: 'Assigned Inspections',
            description: 'Complete your assigned inspections',
            icon: FileText,
            color: 'bg-blue-500',
            action: () => onNavigate('assigned_inspections')
          },
          {
            title: 'Compliance Review',
            description: 'Review compliance status',
            icon: CheckCircle,
            color: 'bg-green-500',
            action: () => onNavigate('compliance')
          }
        );
        break;

      case 'Legal Unit':
        actions.push(
          {
            title: 'Legal Review',
            description: 'Review non-compliant cases',
            icon: AlertTriangle,
            color: 'bg-red-500',
            action: () => onNavigate('legal_review')
          },
          {
            title: 'Violation Cases',
            description: 'Manage violation cases',
            icon: FileText,
            color: 'bg-orange-500',
            action: () => onNavigate('violations')
          }
        );
        break;

      default:
        actions.push(
          {
            title: 'View All Inspections',
            description: 'Browse all inspections',
            icon: FileText,
            color: 'bg-blue-500',
            action: () => onNavigate('all')
          }
        );
    }

    return actions;
  };


  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {userProfile?.first_name || userProfile?.email}!
            </h2>
            <p className="text-gray-600 mt-1">
              {userLevel} • {userProfile?.section || 'All Sections'} • {userProfile?.district || 'All Districts'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Inspections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInspections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingInspections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedInspections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-gray-900">{stats.nonCompliantInspections}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getQuickActions().map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-1 bg-blue-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.user} • {activity.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
