import { useState, useEffect } from "react";
import { 
  X, 
  Edit, 
  Play, 
  CheckCircle, 
  ArrowRight,
  Building,
  Calendar,
  MapPin,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  Eye,
  Mail,
  DollarSign,
  CreditCard
} from "lucide-react";
import { getRoleBasedStatusLabel, statusDisplayMap, getStatusColorClass, getStatusBgColorClass, canUserPerformActions } from "../../constants/inspectionConstants";
import InspectionTimeline from "./InspectionTimeline";
import { canViewInspectionTracking } from "../../utils/permissions";

export default function ViewInspection({ inspection, onClose, onEdit, userLevel, currentUser }) {
  const [activeTab, setActiveTab] = useState('details');
  const [showTimeline, setShowTimeline] = useState(false);
  const [billingData, setBillingData] = useState(null);
  const [loadingBilling, setLoadingBilling] = useState(false);

  // Fetch billing data when component mounts
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!inspection || !inspection.id) return;
      
      try {
        setLoadingBilling(true);
        const response = await fetch(`/api/inspections/${inspection.id}/billing/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBillingData(data);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoadingBilling(false);
      }
    };

    fetchBillingData();
  }, [inspection]);

  const getStatusDisplay = (status) => {
    // Use standardized status label from statusDisplayMap
    const label = statusDisplayMap[status]?.label || status;
    
    const config = statusDisplayMap[status];
    if (!config) {
      return { label, color: 'bg-gray-100 text-gray-800' };
    }
    
    return { 
      label, 
      color: `${getStatusBgColorClass(status)} ${getStatusColorClass(status)}`
    };
  };

  const getSectionDisplay = (section) => {
    const sectionMap = {
      'PD-1586': 'EIA Monitoring',
      'RA-8749': 'Air Quality Monitoring',
      'RA-9275': 'Water Quality Monitoring',
      'RA-6969': 'Toxic Chemicals Monitoring',
      'RA-9003': 'Solid Waste Management'
    };
    return sectionMap[section] || section;
  };

  const getPriorityDisplay = (priority) => {
    const priorityMap = {
      'LOW': { label: 'Low', color: 'bg-gray-100 text-gray-800' },
      'MEDIUM': { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      'HIGH': { label: 'High', color: 'bg-orange-100 text-orange-800' },
      'URGENT': { label: 'Urgent', color: 'bg-red-100 text-red-800' }
    };
    return priorityMap[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };


  const getAvailableActions = () => {
    // Admin users cannot perform any actions
    if (!canUserPerformActions(userLevel)) {
      return [];
    }
    
    const actions = [];

    // Edit button - available for most statuses
    if (inspection.status !== 'COMPLETED' && inspection.status !== 'LEGAL_REVIEW') {
      actions.push({
        icon: Edit,
        label: 'Edit',
        action: () => {
          onEdit(inspection);
          onClose();
        },
        color: 'bg-sky-600 hover:bg-sky-700'
      });
    }

    // Workflow actions based on status
    if (inspection.can_act) {
      if (inspection.status === 'SECTION_REVIEW' || inspection.status === 'UNIT_REVIEW') {
        actions.push({
          icon: Play,
          label: 'Start Inspection',
          action: () => console.log('Start inspection:', inspection.id),
          color: 'bg-green-600 hover:bg-green-700'
        });
      }
      
      if (inspection.status === 'MONITORING_INSPECTION') {
        actions.push({
          icon: CheckCircle,
          label: 'Complete Inspection',
          action: () => console.log('Complete inspection:', inspection.id),
          color: 'bg-green-600 hover:bg-green-700'
        });
      }

      if (inspection.status === 'DIVISION_CREATED' || inspection.status === 'SECTION_INSPECTING' || inspection.status === 'UNIT_INSPECTING') {
        actions.push({
          icon: ArrowRight,
          label: 'Forward',
          action: () => console.log('Forward inspection:', inspection.id),
          color: 'bg-orange-600 hover:bg-orange-700'
        });
      }
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-100 rounded-lg">
            <FileText className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Inspection Details
            </h3>
            <p className="text-sm text-gray-500">
              {inspection.code} - {inspection.establishment_name || inspection.establishment_detail?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {availableActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`flex items-center space-x-2 px-3 py-2 text-sm text-white rounded-md transition-colors ${action.color}`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{action.label}</span>
              </button>
            );
          })}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'details', label: 'Details' },
            { id: 'workflow', label: 'Workflow' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'legal', label: 'Legal Actions' },
            { id: 'billing', label: 'Billing' },
            { id: 'documents', label: 'Documents' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Inspection Code</p>
                      <p className="text-sm text-gray-900">{inspection.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Establishment</p>
                      <p className="text-sm text-gray-900">
                        {inspection.establishment_name || inspection.establishment_detail?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {inspection.establishment_detail?.city}, {inspection.establishment_detail?.province}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">District</p>
                      <p className="text-sm text-gray-900">{inspection.establishment_detail?.district}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Assigned To</p>
                      <p className="text-sm text-gray-900">
                        {inspection.current_assignee_name || inspection.assigned_to || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Status & Priority</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusDisplay(inspection.status).color}`}>
                      {getStatusDisplay(inspection.status).label}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Priority</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityDisplay(inspection.priority).color}`}>
                      {getPriorityDisplay(inspection.priority).label}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created Date</p>
                      <p className="text-sm text-gray-900">{formatDate(inspection.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-900">{formatDate(inspection.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Section Information</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Section/Law</p>
                    <p className="text-sm text-gray-900">{getSectionDisplay(inspection.section)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inspection Type</p>
                    <p className="text-sm text-gray-900">{inspection.inspection_type || 'Routine'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {inspection.description && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{inspection.description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Workflow History</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Workflow history will be displayed here.</p>
              <p className="text-xs text-gray-400 mt-2">
                This feature will show the complete workflow progression and decision history.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Compliance Information</h4>
            
            {/* Inspector Metadata */}
            {inspection.form?.inspector_info && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-md font-semibold text-blue-900 mb-3">Inspection Performed By</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">Inspector</p>
                      <p className="text-sm text-blue-900">{inspection.form.inspector_info.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">Position</p>
                      <p className="text-sm text-blue-900">{inspection.form.inspector_info.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">Section/Unit</p>
                      <p className="text-sm text-blue-900">{inspection.form.inspector_info.section || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">Inspection Date</p>
                      <p className="text-sm text-blue-900">
                        {new Date(inspection.form.inspector_info.inspected_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compliance Decision
                  </label>
                  <div className="text-sm text-gray-900">
                    {inspection.form?.compliance_decision || 'Pending'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Violations Found
                  </label>
                  <div className="text-sm text-gray-900">
                    {inspection.form?.violations_found || 'None'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compliance Plan
                  </label>
                  <div className="text-sm text-gray-900">
                    {inspection.form?.compliance_plan || 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compliance Deadline
                  </label>
                  <div className="text-sm text-gray-900">
                    {inspection.form?.compliance_deadline || 'Not set'}
                  </div>
                </div>
              </div>
              {inspection.form?.findings_summary && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Findings Summary
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-line">
                    {inspection.form.findings_summary}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Legal Actions
            </h4>
            
            {/* NOV Section */}
            {inspection.nov && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-5 w-5 text-red-600" />
                  <h5 className="text-md font-semibold text-red-900">Notice of Violation (NOV)</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-red-700">Sent Date</p>
                    <p className="text-sm text-red-900">{formatDate(inspection.nov.sent_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">Sent To</p>
                    <p className="text-sm text-red-900">{inspection.nov.recipient_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">Contact Person</p>
                    <p className="text-sm text-red-900">{inspection.nov.contact_person || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">Compliance Deadline</p>
                    <p className="text-sm text-red-900">
                      {formatDate(inspection.nov.compliance_deadline)}
                      {inspection.nov.compliance_deadline && (
                        <span className="ml-2 text-xs text-red-600">
                          ({Math.ceil((new Date(inspection.nov.compliance_deadline) - new Date()) / (1000 * 60 * 60 * 24))} days remaining)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Compliance
                  </span>
                </div>
                {inspection.nov.violations && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-red-700 mb-2">Violations</p>
                    <div className="bg-white border border-red-200 rounded p-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{inspection.nov.violations}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* NOO Section */}
            {inspection.noo && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <h5 className="text-md font-semibold text-orange-900">Notice of Order (NOO)</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Sent Date</p>
                    <p className="text-sm text-orange-900">{formatDate(inspection.noo.sent_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Sent To</p>
                    <p className="text-sm text-orange-900">{inspection.noo.recipient_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Contact Person</p>
                    <p className="text-sm text-orange-900">{inspection.noo.contact_person || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Payment Deadline</p>
                    <p className="text-sm text-orange-900">{formatDate(inspection.noo.payment_deadline)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Total Penalty</p>
                    <p className="text-lg font-bold text-orange-900">
                      ₱{Number(inspection.noo.penalty_fees || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Payment Overdue
                  </span>
                </div>
                {inspection.noo.violation_breakdown && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-orange-700 mb-2">Violation Breakdown</p>
                    <div className="bg-white border border-orange-200 rounded p-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{inspection.noo.violation_breakdown}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!inspection.nov && !inspection.noo && (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No legal actions have been taken for this inspection.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Billing Information
            </h4>
            
            {loadingBilling ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-gray-500">Loading billing information...</p>
              </div>
            ) : billingData ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-700">Billing Code</p>
                    <p className="text-sm text-green-900 font-mono">{billingData.billing_code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Billing Type</p>
                    <p className="text-sm text-green-900">{billingData.billing_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Amount</p>
                    <p className="text-lg font-bold text-green-900">
                      ₱{Number(billingData.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Due Date</p>
                    <p className="text-sm text-green-900">{formatDate(billingData.due_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Contact Person</p>
                    <p className="text-sm text-green-900">{billingData.contact_person || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Related Law</p>
                    <p className="text-sm text-green-900">{billingData.related_law}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Unpaid
                  </span>
                </div>
                {billingData.description && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-green-700 mb-2">Description</p>
                    <div className="bg-white border border-green-200 rounded p-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{billingData.description}</p>
                    </div>
                  </div>
                )}
                {billingData.recommendations && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-green-700 mb-2">Payment Instructions</p>
                    <div className="bg-white border border-green-200 rounded p-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{billingData.recommendations}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No billing information available for this inspection.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Required Documents</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Document requirements will be displayed here.</p>
              <p className="text-xs text-gray-400 mt-2">
                This feature will show required documents and their status.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Inspection Tracking Timeline - Admin Only */}
      {canViewInspectionTracking(userLevel) && inspection.history && inspection.history.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inspection Tracking</h3>
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Clock className="h-4 w-4" />
              {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
            </button>
          </div>
          
          {showTimeline && (
            <div className="mt-4">
              <InspectionTimeline history={inspection.history} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}