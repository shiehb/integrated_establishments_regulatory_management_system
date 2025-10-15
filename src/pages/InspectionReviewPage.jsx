import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationManager';
import api from '../services/api';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Send, FileCheck, Printer } from 'lucide-react';
import LayoutForm from '../components/LayoutForm';

const InspectionReviewPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const notifications = useNotifications();
  
  const urlParams = new URLSearchParams(location.search);
  const mode = urlParams.get('mode') || 'preview';
  
  const [inspectionData, setInspectionData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState('');

  // Load data based on mode
  useEffect(() => {
    if (mode === 'preview') {
      // Preview mode: use navigation state
      if (location.state) {
        setFormData(location.state.formData);
        setInspectionData(location.state.inspectionData);
      } else {
        notifications.error('No data to preview');
        navigate(-1);
      }
    } else {
      // Review mode: fetch from API
      fetchInspectionData();
    }
  }, [mode, id]);

  const fetchInspectionData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/inspections/${id}/`);
      setInspectionData(response.data);
      setFormData(response.data.form?.checklist || {});
    } catch (error) {
      console.error('Error fetching inspection:', error);
      notifications.error('Failed to load inspection data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  const getComplianceStatus = () => {
    if (mode === 'preview' && location.state?.compliance) {
      return location.state.compliance;
    }
    return formData?.compliance_status || 'PENDING';
  };

  const handleBackToEdit = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (!remarks.trim() && mode !== 'preview') {
      notifications.warning('Please provide remarks');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'preview') {
        // Submit inspection
        await handlePreviewSubmit();
      } else {
        // Handle review action
        await handleReviewAction();
      }
    } catch (error) {
      console.error('Error:', error);
      notifications.error(error.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewSubmit = async () => {
    try {
      const payload = {
        ...formData,
        is_draft: false,
        completed_at: new Date().toISOString()
      };

      await api.post(`/api/inspections/${id}/complete/`, payload);
      notifications.success('Inspection submitted successfully!');
      navigate('/inspections');
    } catch (error) {
      throw error;
    }
  };

  const handleReviewAction = async () => {
    const endpoints = {
      approve_unit: `/api/inspections/${id}/submit-for-review/`,
      approve_section: `/api/inspections/${id}/send-to-next-level/`,
      approve_division: `/api/inspections/${id}/close/`,
      forward_legal: `/api/inspections/${id}/forward-to-legal/`,
      send_nov: `/api/inspections/${id}/send-nov/`,
      send_noo: `/api/inspections/${id}/send-noo/`,
      reject: `/api/inspections/${id}/return/`,
      mark_compliant: `/api/inspections/${id}/mark-as-compliant/`
    };

    const endpoint = endpoints[actionType];
    if (!endpoint) return;

    await api.post(endpoint, { remarks: remarks.trim() });
    notifications.success('Action completed successfully!');
    navigate('/inspections');
  };

  const handleActionClick = (type) => {
    setActionType(type);
    setShowConfirm(true);
  };

  if (loading && !inspectionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inspection data...</p>
        </div>
      </div>
    );
  }

  if (!inspectionData || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const complianceStatus = getComplianceStatus();
  const general = formData.general || {};
  const purpose = formData.purpose || {};
  const permits = formData.permits || [];
  const complianceItems = formData.complianceItems || [];
  const systems = formData.systems || [];
  const recommendations = formData.recommendationState || {};

  // Custom header for review page
  const reviewHeader = (
    <div className="bg-white border-b border-gray-300 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Title and ID */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToEdit}
              className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-sky-600" />
                {mode === 'preview' ? 'Inspection Preview' : 'Inspection Review'}
              </h1>
              <p className="text-xs text-gray-600">
                {inspectionData?.custom_id || inspectionData?.id} | {inspectionData?.establishments_detail?.[0]?.name}
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>

            {mode === 'preview' ? (
              <button
                onClick={() => handleActionClick('submit')}
                className="flex items-center px-4 py-2 text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors font-semibold"
                disabled={loading}
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            ) : (
              <>
                {currentUser?.userlevel === 'Unit Head' && (
                  <>
                    <button
                      onClick={() => handleActionClick('reject')}
                      className="px-3 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors text-sm"
                      disabled={loading}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleActionClick('approve_unit')}
                      className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors font-semibold text-sm"
                      disabled={loading}
                    >
                      Approve & Send to Section
                    </button>
                  </>
                )}

                {currentUser?.userlevel === 'Section Chief' && (
                  <>
                    <button
                      onClick={() => handleActionClick('reject')}
                      className="px-3 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors text-sm"
                      disabled={loading}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleActionClick('approve_section')}
                      className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors font-semibold text-sm"
                      disabled={loading}
                    >
                      Approve & Send to Division
                    </button>
                  </>
                )}

                {currentUser?.userlevel === 'Division Chief' && (
                  <>
                    <button
                      onClick={() => handleActionClick('mark_compliant')}
                      className="px-3 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors text-sm"
                      disabled={loading}
                    >
                      Mark Compliant
                    </button>
                    <button
                      onClick={() => handleActionClick('forward_legal')}
                      className="px-3 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors text-sm"
                      disabled={loading}
                    >
                      Forward to Legal
                    </button>
                    <button
                      onClick={() => handleActionClick('approve_division')}
                      className="px-4 py-2 text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors font-semibold text-sm"
                      disabled={loading}
                    >
                      Approve & Close
                    </button>
                  </>
                )}

                {currentUser?.userlevel === 'Legal Unit' && (
                  <>
                    <button
                      onClick={() => handleActionClick('send_nov')}
                      className="px-3 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors text-sm"
                      disabled={loading}
                    >
                      Send NOV
                    </button>
                    <button
                      onClick={() => handleActionClick('send_noo')}
                      className="px-3 py-2 text-white bg-red-700 rounded-md hover:bg-red-800 transition-colors text-sm"
                      disabled={loading}
                    >
                      Send NOO
                    </button>
                    <button
                      onClick={() => handleActionClick('reject')}
                      className="px-3 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 transition-colors text-sm"
                      disabled={loading}
                    >
                      Return to Division
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <LayoutForm inspectionHeader={reviewHeader}>
      <div className="max-w-[1200px] mx-auto print:max-w-none">
        {/* PDF Document Container */}
        <div className="bg-white shadow-lg print:shadow-none" style={{ padding: '60px' }}>
          
          {/* Official Header */}
          <div className="text-center border-t-4 border-b-4 border-gray-800 py-4 mb-8">
            <h1 className="text-xl font-bold uppercase tracking-wide">
              DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES
            </h1>
            <h2 className="text-lg font-semibold mt-1">
              Environmental Management Bureau
            </h2>
            <h3 className="text-base font-semibold mt-2 uppercase">
              Inspection Report Summary
            </h3>
          </div>

          {/* Document Info */}
          <div className="mb-6 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Inspection Reference No.:</p>
                <p className="text-gray-700">{inspectionData.custom_id || inspectionData.id}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Date Generated:</p>
                <p className="text-gray-700">{formatDate(new Date())}</p>
              </div>
            </div>
            
            {/* Overall Status Badge */}
            <div className="mt-4">
              <div className={`inline-flex items-center px-4 py-2 rounded-md font-semibold ${
                complianceStatus === 'COMPLIANT' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {complianceStatus === 'COMPLIANT' ? (
                  <><CheckCircle className="w-5 h-5 mr-2" /> COMPLIANT</>
                ) : (
                  <><XCircle className="w-5 h-5 mr-2" /> NON-COMPLIANT</>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <p><span className="font-semibold">Establishment:</span> {general.establishment_name || inspectionData.establishments_detail?.[0]?.name}</p>
              <p><span className="font-semibold">Address:</span> {general.address || inspectionData.establishments_detail?.[0]?.full_address}</p>
            </div>
          </div>

          {/* I. GENERAL INFORMATION */}
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-2 mb-4">
              I. GENERAL INFORMATION
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-700">Name of Establishment:</p>
                  <p className="text-gray-900">{general.establishment_name || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Nature of Business:</p>
                  <p className="text-gray-900">{general.nature_of_business || '-'}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700">Address:</p>
                <p className="text-gray-900">{general.address || '-'}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-gray-700">Coordinates:</p>
                  <p className="text-gray-900">{general.coordinates || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Year Established:</p>
                  <p className="text-gray-900">{general.year_established || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Inspection Date & Time:</p>
                  <p className="text-gray-900">{general.inspection_date_time ? formatDate(general.inspection_date_time) : '-'}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-2">Operating Schedule:</p>
                <div className="ml-4 space-y-1">
                  <p>• Operating Hours: {general.operating_hours || '-'} hours/day</p>
                  <p>• Operating Days per Week: {general.operating_days_per_week || '-'} days</p>
                  <p>• Operating Days per Year: {general.operating_days_per_year || '-'} days</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-700">Contact Information:</p>
                  <p>• Phone/Fax: {general.phone_fax_no || '-'}</p>
                  <p>• Email: {general.email_address || '-'}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-2">Applicable Environmental Laws:</p>
                <div className="ml-4 space-y-1">
                  {general.environmental_laws && general.environmental_laws.length > 0 ? (
                    general.environmental_laws.map(law => (
                      <p key={law}>☑ {law} {inspectionData.law === law ? '(Required)' : ''}</p>
                    ))
                  ) : (
                    <p className="text-gray-500">No laws selected</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* II. PURPOSE OF INSPECTION */}
          <section className="mb-8 page-break-before">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-2 mb-4">
              II. PURPOSE OF INSPECTION
            </h2>
            
            <div className="space-y-2 text-sm">
              {purpose.verify_accuracy && (
                <div>
                  <p className="font-semibold">☑ Verify Accuracy of Data Submitted</p>
                  {purpose.verify_accuracy_details && purpose.verify_accuracy_details.length > 0 && (
                    <div className="ml-6 mt-1">
                      {purpose.verify_accuracy_details.map((detail, idx) => (
                        <p key={idx} className="text-gray-700">⤷ {detail}</p>
                      ))}
                      {purpose.verify_accuracy_others && (
                        <p className="text-gray-700">⤷ Other: {purpose.verify_accuracy_others}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {purpose.determine_compliance && (
                <div>
                  <p className="font-semibold">☑ Determine Compliance with Environmental Laws</p>
                  <p className="ml-6 text-gray-700">All selected environmental laws and permits</p>
                </div>
              )}

              {purpose.investigate_complaints && (
                <div>
                  <p className="font-semibold">☑ Investigate Complaints</p>
                </div>
              )}

              {purpose.check_commitment_status && (
                <div>
                  <p className="font-semibold">☑ Check Status of Commitments from Previous Technical Conference</p>
                  {purpose.commitment_status_details && purpose.commitment_status_details.length > 0 && (
                    <div className="ml-6 mt-1">
                      {purpose.commitment_status_details.map((detail, idx) => (
                        <p key={idx} className="text-gray-700">⤷ {detail}</p>
                      ))}
                      {purpose.commitment_status_others && (
                        <p className="text-gray-700">⤷ Other: {purpose.commitment_status_others}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {purpose.other_purpose && (
                <div>
                  <p className="font-semibold">☑ Other Purpose</p>
                  {purpose.other_purpose_specify && (
                    <p className="ml-6 text-gray-700">{purpose.other_purpose_specify}</p>
                  )}
                </div>
              )}

              {!purpose.verify_accuracy && !purpose.determine_compliance && 
               !purpose.investigate_complaints && !purpose.check_commitment_status && 
               !purpose.other_purpose && (
                <p className="text-gray-500">No purpose specified</p>
              )}
            </div>
          </section>

          {/* III. DENR PERMITS */}
          <section className="mb-8 page-break-before">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-2 mb-4">
              III. COMPLIANCE STATUS - DENR PERMITS, LICENSES & CLEARANCES
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Environmental Law</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Permit Type</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Permit Number</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Date Issued</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {permits && permits.filter(p => p.permitNumber && p.permitNumber.trim()).length > 0 ? (
                    permits.filter(p => p.permitNumber && p.permitNumber.trim()).map((permit, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-3 py-2">{permit.lawId}</td>
                        <td className="border border-gray-300 px-3 py-2">{permit.permitType}</td>
                        <td className="border border-gray-300 px-3 py-2 font-mono">{permit.permitNumber}</td>
                        <td className="border border-gray-300 px-3 py-2">{formatDateOnly(permit.dateIssued)}</td>
                        <td className="border border-gray-300 px-3 py-2">{formatDateOnly(permit.expiryDate)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                        No permits recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* IV. SUMMARY OF COMPLIANCE */}
          <section className="mb-8 page-break-before">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-2 mb-4">
              IV. SUMMARY OF COMPLIANCE
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Compliance Item</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-24">Status</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceItems && complianceItems.length > 0 ? (
                    complianceItems.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-3 py-2">{item.item || item.title}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {item.compliant === 'Yes' && <span className="text-green-600 font-semibold">✅ Yes</span>}
                          {item.compliant === 'No' && <span className="text-red-600 font-semibold">❌ No</span>}
                          {item.compliant === 'N/A' && <span className="text-gray-500 font-semibold">⊝ N/A</span>}
                          {!item.compliant && <span className="text-gray-400">-</span>}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {item.compliant === 'No' ? (
                            <span className="text-red-700">{item.remarks || item.remarksOption || '-'}</span>
                          ) : (
                            <span>{item.remarks || '-'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                        No compliance items recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* V. SUMMARY OF FINDINGS AND OBSERVATIONS */}
          <section className="mb-8 page-break-before">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-2 mb-4">
              V. SUMMARY OF FINDINGS AND OBSERVATIONS
            </h2>
            
            <div className="space-y-4 text-sm">
              {systems && systems.filter(s => s.compliant || s.nonCompliant).length > 0 ? (
                systems.filter(s => s.compliant || s.nonCompliant).map((system, idx) => (
                  <div key={idx} className="border-l-4 border-gray-300 pl-4">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold">{idx + 1}. {system.system}</p>
                      <span className={`ml-4 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                        system.compliant ? 'bg-green-100 text-green-800' : 
                        system.nonCompliant ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {system.compliant ? '✅ Compliant' : system.nonCompliant ? '❌ Non-Compliant' : 'N/A'}
                      </span>
                    </div>
                    {system.nonCompliant && system.remarks && (
                      <div className="mt-2">
                        <p className="text-gray-700"><span className="font-semibold">Finding:</span> {system.remarks}</p>
                      </div>
                    )}
                    {system.compliant && system.remarks && (
                      <div className="mt-2">
                        <p className="text-gray-700"><span className="font-semibold">Observation:</span> {system.remarks}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No findings recorded</p>
              )}

              {typeof formData.generalFindings === 'string' && formData.generalFindings.trim() && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
                  <p className="font-semibold mb-2">General Findings:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.generalFindings}</p>
                </div>
              )}
            </div>
          </section>

          {/* VI. RECOMMENDATIONS */}
          {complianceStatus !== 'COMPLIANT' && recommendations.checked && recommendations.checked.length > 0 && (
            <section className="mb-8 page-break-before">
              <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-2 mb-4">
                VI. RECOMMENDATIONS
              </h2>
              
              <p className="text-sm mb-4">Based on the inspection findings, the following actions are recommended:</p>
              
              <div className="space-y-3 text-sm">
                {recommendations.checked.map((rec, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="font-semibold mr-2">☑</span>
                    <div className="flex-1">
                      <p className="font-semibold">{rec}</p>
                      <p className="text-gray-600 mt-1">Priority: HIGH</p>
                    </div>
                  </div>
                ))}

                {typeof recommendations.otherText === 'string' && recommendations.otherText.trim() && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                    <p className="font-semibold mb-2">Additional Recommendations:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{recommendations.otherText}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* VII. OVERALL ASSESSMENT */}
          <section className="mb-8">
            <div className={`border-4 p-6 rounded ${
              complianceStatus === 'COMPLIANT' 
                ? 'border-green-600 bg-green-50' 
                : 'border-red-600 bg-red-50'
            }`}>
              <h2 className="text-lg font-bold uppercase text-center mb-4">
                OVERALL ASSESSMENT
              </h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">Compliance Status:</p>
                  <p className={`text-lg font-bold ${
                    complianceStatus === 'COMPLIANT' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {complianceStatus === 'COMPLIANT' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
                  </p>
                </div>

                {complianceStatus !== 'COMPLIANT' && (
                  <>
                    <div>
                      <p className="font-semibold">Violations Found:</p>
                      <ul className="list-disc ml-6 mt-1 space-y-1">
                        {systems.filter(s => s.nonCompliant).map((system, idx) => (
                          <li key={idx} className="text-gray-700">{system.system}</li>
                        ))}
                        {complianceItems.filter(item => item.compliant === 'No').map((item, idx) => (
                          <li key={`ci-${idx}`} className="text-gray-700">{item.item || item.title}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold">Required Actions:</p>
                      <p className="text-gray-700 mt-1">
                        The establishment must submit a corrective action plan and implement necessary improvements within the specified timeframe.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">
                {mode === 'preview' ? 'Confirm Submission' : 'Confirm Action'}
              </h3>
              
              {mode === 'preview' ? (
                <p className="text-gray-700 mb-4">
                  Are you sure you want to submit this inspection for review? Please ensure all information is correct.
                </p>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    Please provide remarks for this action:
                  </p>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    rows="4"
                    placeholder="Enter your remarks here..."
                    required
                  />
                </>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-white bg-sky-600 rounded-md hover:bg-sky-700 font-semibold"
                  disabled={loading || (mode !== 'preview' && !remarks.trim())}
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          
          .page-break-before {
            page-break-before: always;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </LayoutForm>
  );
};

export default InspectionReviewPage;

