import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LayoutWithSidebar from '../components/LayoutWithSidebar';
import { getInspection, getProfile } from '../services/api';
import { 
  ArrowLeft,
  Building,
  Calendar,
  MapPin,
  FileText,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Scale,
  AlertTriangle,
  Mail,
  DollarSign,
  CreditCard,
  Users
} from 'lucide-react';
import { 
  getRoleBasedStatusLabel, 
  statusDisplayMap, 
  getStatusColorClass, 
  getStatusBgColorClass,
  canUserPerformActions 
} from '../constants/inspectionConstants';

export default function InspectionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState('public');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [billingData, setBillingData] = useState(null);
  const [loadingBilling, setLoadingBilling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profile = await getProfile();
        setUserLevel(profile.userlevel || 'public');
        setCurrentUser(profile);
        
        // Fetch inspection details
        const inspectionData = await getInspection(id);
        setInspection(inspectionData);
      } catch (error) {
        console.error('Error fetching inspection:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch billing data when inspection is loaded
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
    const label = (inspection && userLevel && currentUser) 
      ? getRoleBasedStatusLabel(status, userLevel, inspection, currentUser.id)
      : statusDisplayMap[status]?.label || status;
    
    const config = statusDisplayMap[status];
    if (!config) {
      return { label, color: 'bg-gray-100 text-gray-800' };
    }
    
    return { 
      label, 
      color: `${getStatusBgColorClass(status)} ${getStatusColorClass(status)}`
    };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel={userLevel}>
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center text-gray-600">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
              <span className="text-lg">Loading inspection...</span>
            </div>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  if (!inspection) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel={userLevel}>
          <div className="flex flex-col items-center justify-center h-screen">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Inspection Not Found</h2>
            <p className="text-gray-500 mb-6">The inspection you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/inspections')}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inspections
            </button>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  const statusDisplay = getStatusDisplay(inspection.current_status);

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel={userLevel}>
        <div className="p-3 bg-gray-50 min-h-screen">
          {/* Back Button & Title */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/inspections')}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Inspection Details</h1>
                <p className="text-xs text-gray-500">{inspection.code}</p>
              </div>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
              {statusDisplay.label}
            </span>
          </div>

          {/* Main Content with Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-4">
                {[
                  { id: 'details', label: 'Details', icon: FileText },
                  { id: 'compliance', label: 'Compliance', icon: CheckCircle },
                  { id: 'legal', label: 'Legal Actions', icon: AlertTriangle },
                  { id: 'billing', label: 'Billing', icon: DollarSign }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'border-sky-500 text-sky-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">Basic Information</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Inspection Code</p>
                            <p className="text-sm font-medium text-gray-900">{inspection.code}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Law</p>
                            <p className="text-sm font-medium text-gray-900">{inspection.law || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Assigned To</p>
                            <p className="text-sm font-medium text-gray-900">{inspection.assigned_to_name || 'Unassigned'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Inspected By</p>
                            <p className="text-sm font-medium text-gray-900">{inspection.inspected_by_name || 'Not Inspected'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">Timeline</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-sm font-medium text-gray-900">{formatDateTime(inspection.created_at)}</p>
                          </div>
                        </div>

                        {inspection.form?.scheduled_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Scheduled Date</p>
                              <p className="text-sm font-medium text-gray-900">{formatDateTime(inspection.form.scheduled_at)}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.color}`}>
                              {statusDisplay.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Establishments */}
                  {inspection.establishments_detail && inspection.establishments_detail.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Establishments</h4>
                      <div className="space-y-2">
                        {inspection.establishments_detail.map((est, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-start gap-2">
                              <Building className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-gray-900">{est.name}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {[est.street_building, est.barangay, est.city, est.province]
                                    .filter(Boolean)
                                    .join(', ')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Compliance Information</h4>
                  
                  {inspection.form ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Compliance Status</label>
                          <div className="flex items-center gap-2">
                            {inspection.form.compliance_decision === 'COMPLIANT' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : inspection.form.compliance_decision === 'NON_COMPLIANT' ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : null}
                            <span className="text-sm font-medium text-gray-900">{inspection.form.compliance_decision || 'PENDING'}</span>
                          </div>
                        </div>
                      </div>

                      {inspection.form.findings_summary && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-2">Findings Summary</label>
                          <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-line">
                            {inspection.form.findings_summary}
                          </div>
                        </div>
                      )}

                      {inspection.form.violations_found && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-2">Violations Found</label>
                          <div className="text-sm text-gray-900 bg-red-50 p-3 rounded border border-red-200 whitespace-pre-line">
                            {inspection.form.violations_found}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No compliance information available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'legal' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Legal Actions
                  </h4>
                  
                  {/* NOV Section */}
                  {inspection.nov && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-red-600" />
                        <h5 className="text-sm font-semibold text-red-900">Notice of Violation (NOV)</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-red-700 font-medium">Sent Date</p>
                          <p className="text-red-900">{formatDateTime(inspection.nov.sent_date)}</p>
                        </div>
                        <div>
                          <p className="text-red-700 font-medium">Sent To</p>
                          <p className="text-red-900">{inspection.nov.recipient_email}</p>
                        </div>
                        <div>
                          <p className="text-red-700 font-medium">Contact Person</p>
                          <p className="text-red-900">{inspection.nov.contact_person || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-red-700 font-medium">Compliance Deadline</p>
                          <p className="text-red-900">{formatDateTime(inspection.nov.compliance_deadline)}</p>
                        </div>
                      </div>
                      {inspection.nov.violations && (
                        <div className="mt-3">
                          <p className="text-red-700 font-medium text-xs mb-1">Violations</p>
                          <div className="bg-white border border-red-200 rounded p-2">
                            <p className="text-xs text-gray-900 whitespace-pre-wrap">{inspection.nov.violations}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* NOO Section */}
                  {inspection.noo && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-orange-600" />
                        <h5 className="text-sm font-semibold text-orange-900">Notice of Order (NOO)</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-orange-700 font-medium">Sent Date</p>
                          <p className="text-orange-900">{formatDateTime(inspection.noo.sent_date)}</p>
                        </div>
                        <div>
                          <p className="text-orange-700 font-medium">Sent To</p>
                          <p className="text-orange-900">{inspection.noo.recipient_email}</p>
                        </div>
                        <div>
                          <p className="text-orange-700 font-medium">Contact Person</p>
                          <p className="text-orange-900">{inspection.noo.contact_person || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-orange-700 font-medium">Payment Deadline</p>
                          <p className="text-orange-900">{formatDateTime(inspection.noo.payment_deadline)}</p>
                        </div>
                        <div>
                          <p className="text-orange-700 font-medium">Total Penalty</p>
                          <p className="text-orange-900 font-bold">
                            ₱{Number(inspection.noo.penalty_fees || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      {inspection.noo.violation_breakdown && (
                        <div className="mt-3">
                          <p className="text-orange-700 font-medium text-xs mb-1">Violation Breakdown</p>
                          <div className="bg-white border border-orange-200 rounded p-2">
                            <p className="text-xs text-gray-900 whitespace-pre-wrap">{inspection.noo.violation_breakdown}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!inspection.nov && !inspection.noo && (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No legal actions have been taken for this inspection.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Billing Information
                  </h4>
                  
                  {loadingBilling ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-spin" />
                      <p className="text-sm text-gray-500">Loading billing information...</p>
                    </div>
                  ) : billingData ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-green-700 font-medium">Billing Code</p>
                          <p className="text-green-900 font-mono">{billingData.billing_code}</p>
                        </div>
                        <div>
                          <p className="text-green-700 font-medium">Billing Type</p>
                          <p className="text-green-900">{billingData.billing_type}</p>
                        </div>
                        <div>
                          <p className="text-green-700 font-medium">Amount</p>
                          <p className="text-green-900 font-bold">
                            ₱{Number(billingData.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-green-700 font-medium">Due Date</p>
                          <p className="text-green-900">{formatDateTime(billingData.due_date)}</p>
                        </div>
                        <div>
                          <p className="text-green-700 font-medium">Contact Person</p>
                          <p className="text-green-900">{billingData.contact_person || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-green-700 font-medium">Related Law</p>
                          <p className="text-green-900">{billingData.related_law}</p>
                        </div>
                      </div>
                      {billingData.description && (
                        <div className="mt-3">
                          <p className="text-green-700 font-medium text-xs mb-1">Description</p>
                          <div className="bg-white border border-green-200 rounded p-2">
                            <p className="text-xs text-gray-900 whitespace-pre-wrap">{billingData.description}</p>
                          </div>
                        </div>
                      )}
                      {billingData.recommendations && (
                        <div className="mt-3">
                          <p className="text-green-700 font-medium text-xs mb-1">Payment Instructions</p>
                          <div className="bg-white border border-green-200 rounded p-2">
                            <p className="text-xs text-gray-900 whitespace-pre-wrap">{billingData.recommendations}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No billing information available for this inspection.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
