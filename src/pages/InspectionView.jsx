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
  Scale
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

          {/* Main Content - Essential Info Only */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="space-y-3">
              {/* Key Information Grid */}
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Scale className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Law</div>
                    <div className="font-medium text-gray-900">{inspection.law || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Assigned To</div>
                    <div className="font-medium text-gray-900">{inspection.assigned_to_name || 'Unassigned'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Inspected By</div>
                    <div className="font-medium text-gray-900">{inspection.inspected_by_name || 'Not Inspected'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="font-medium text-gray-900 text-xs">
                      {formatDateTime(inspection.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Establishments */}
              {inspection.establishments_detail && inspection.establishments_detail.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Establishments</label>
                  <div className="space-y-2">
                    {inspection.establishments_detail.map((est, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                        <div className="font-medium text-gray-900">{est.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {[est.street_building, est.barangay, est.city, est.province]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Data - Only if exists */}
              {inspection.form && (
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Scheduled Date</label>
                      <div className="text-gray-900">{formatDateTime(inspection.form.scheduled_at)}</div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Compliance Status</label>
                      <div className="flex items-center gap-2">
                        {inspection.form.compliance_decision === 'COMPLIANT' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : inspection.form.compliance_decision === 'NON_COMPLIANT' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : null}
                        <span className="text-gray-900">{inspection.form.compliance_decision}</span>
                      </div>
                    </div>
                  </div>

                  {inspection.form.findings_summary && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Findings Summary</label>
                      <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 whitespace-pre-line">
                        {inspection.form.findings_summary}
                      </div>
                    </div>
                  )}

                  {inspection.form.violations_found && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Violations Found</label>
                      <div className="text-sm text-gray-900 bg-red-50 p-2 rounded border border-red-200 whitespace-pre-line">
                        {inspection.form.violations_found}
                      </div>
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
