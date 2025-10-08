import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  Trash2, 
  Eye, 
  User, 
  Building, 
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  RefreshCw
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadNotificationsCount,
  bulkMarkNotificationsAsRead,
  bulkDeleteNotifications,
  getNotificationStats
} from '../services/api';
import NotificationDetailModal from '../components/NotificationDetailModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { useNotifications } from '../components/NotificationManager';
import DateRangeDropdown from '../components/DateRangeDropdown';

export default function NotificationManagement() {
  const notifications = useNotifications();
  const [notificationList, setNotificationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    today: 0
  });

  // Notification type options
  const notificationTypes = [
    { value: '', label: 'All Types' },
    { value: 'new_user', label: 'New User' },
    { value: 'new_establishment', label: 'New Establishment' },
    { value: 'password_reset', label: 'Password Reset' },
    { value: 'inspection_assigned', label: 'Inspection Assigned' },
    { value: 'inspection_completed', label: 'Inspection Completed' },
    { value: 'system', label: 'System' }
  ];

  // Status filter options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' }
  ];

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotificationList(data);
      
      // Calculate stats
      const total = data.length;
      const unread = data.filter(n => !n.is_read).length;
      const read = total - unread;
      const today = data.filter(n => {
        const notificationDate = new Date(n.created_at);
        const todayDate = new Date();
        return notificationDate.toDateString() === todayDate.toDateString();
      }).length;

      setStats({ total, unread, read, today });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      notifications.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter and sort notifications
  const filteredAndSortedNotifications = useCallback(() => {
    let filtered = [...notificationList];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notification.recipient && 
          `${notification.recipient.first_name} ${notification.recipient.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (notification.sender && 
          `${notification.sender.first_name} ${notification.sender.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(notification => notification.notification_type === typeFilter);
    }

    // Apply status filter
    if (statusFilter === 'read') {
      filtered = filtered.filter(notification => notification.is_read);
    } else if (statusFilter === 'unread') {
      filtered = filtered.filter(notification => !notification.is_read);
    }

    // Apply date filter
    if (dateFrom) {
      filtered = filtered.filter(notification => 
        new Date(notification.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(notification => 
        new Date(notification.created_at) <= new Date(dateTo + 'T23:59:59')
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [notificationList, searchQuery, typeFilter, statusFilter, dateFrom, dateTo, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronDown size={16} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp size={16} className="text-blue-600" /> : 
      <ChevronDown size={16} className="text-blue-600" />;
  };

  // Handle selection
  const toggleSelect = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const toggleSelectAll = () => {
    const filteredNotifications = filteredAndSortedNotifications();
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotificationList(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      notifications.success('Notification marked as read');
      fetchNotifications(); // Refresh stats
    } catch (error) {
      console.error('Error marking notification as read:', error);
      notifications.error('Failed to mark notification as read');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      notifications.success('All notifications marked as read');
      fetchNotifications();
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      notifications.error('Failed to mark all notifications as read');
    }
  };

  // Handle delete
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotificationList(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      notifications.success('Notification deleted');
      fetchNotifications(); // Refresh stats
    } catch (error) {
      console.error('Error deleting notification:', error);
      notifications.error('Failed to delete notification');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await bulkDeleteNotifications(selectedNotifications);
      setNotificationList(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
      notifications.success(`${selectedNotifications.length} notifications deleted`);
      fetchNotifications(); // Refresh stats
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
      notifications.error('Failed to delete selected notifications');
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    try {
      await deleteAllNotifications();
      setNotificationList([]);
      setSelectedNotifications([]);
      notifications.success('All notifications cleared');
      fetchNotifications(); // Refresh stats
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      notifications.error('Failed to clear all notifications');
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_user':
        return <User size={16} className="text-blue-500" />;
      case 'new_establishment':
        return <Building size={16} className="text-green-500" />;
      case 'password_reset':
        return <CheckCircle size={16} className="text-orange-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = filteredAndSortedNotifications();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600">Manage and monitor all system notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-green-600">{stats.read}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full lg:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="w-full lg:w-64">
            <DateRangeDropdown
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedNotifications.length} selected
            </span>
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
            >
              Mark as Read
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedNotifications([])}
              className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 p-3 text-center border-b border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length > 0 && selectedNotifications.length === filteredNotifications.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                {[
                  { key: "notification_type", label: "Type", sortable: false, width: "w-20" },
                  { key: "id", label: "ID", sortable: true, width: "w-16" },
                  { key: "title", label: "Title", sortable: true, width: "w-64" },
                  { key: "message", label: "Message", sortable: false, width: "w-80" },
                  { key: "is_read", label: "Status", sortable: true, width: "w-24" },
                  { key: "recipient", label: "Recipient", sortable: false, width: "w-40" },
                  { key: "created_at", label: "Created", sortable: true, width: "w-32" },
                  { key: "actions", label: "Actions", sortable: false, width: "w-32" }
                ].map((col) => (
                  <th
                    key={col.key}
                    className={`p-3 border-b border-gray-300 ${col.width} ${
                      col.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{col.label}</span>
                      {col.sortable && getSortIcon(col.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600">Loading notifications...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No notifications found
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className={`text-sm border-b border-gray-200 hover:bg-gray-50 ${
                      !notification.is_read ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelect(notification.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3 text-center">
                      {getNotificationIcon(notification.notification_type)}
                    </td>
                    <td className="p-3 font-mono text-sm">
                      #{notification.id}
                    </td>
                    <td className="p-3">
                      <div className="font-medium truncate" title={notification.title}>
                        {notification.title}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-gray-600 truncate max-w-xs" title={notification.message}>
                        {notification.message}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        notification.is_read 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {notification.is_read ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="p-3">
                      {notification.recipient ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {notification.recipient.first_name} {notification.recipient.last_name}
                          </div>
                          <div className="text-gray-500">{notification.recipient.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {formatDate(notification.created_at)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedNotification(notification);
                            setIsModalOpen(true);
                            if (!notification.is_read) {
                              handleMarkAsRead(notification.id);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded"
                            title="Mark as Read"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDeleteTarget(notification);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        title="Delete Notification"
        icon={<Trash2 className="w-5 h-5 text-red-600" />}
        headerColor="red"
        message={
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-800">Notification Details</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="text-gray-900">#{deleteTarget?.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Title:</span>
                  <span className="text-gray-900">{deleteTarget?.title}</span>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800">Warning</span>
              </div>
              <p className="text-sm text-red-700">
                This action cannot be undone. The notification will be permanently deleted.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Are you sure you want to delete this notification?</p>
            </div>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        size="lg"
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget.id);
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
