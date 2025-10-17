import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationManager';
import api from '../services/api';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Send, FileCheck } from 'lucide-react';
import LayoutForm from '../components/LayoutForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

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

  // Process compliance items for merged law citations (moved to top level)
  const processedComplianceItems = useMemo(() => {
    if (!formData?.complianceItems || formData.complianceItems.length === 0) {
      return [];
    }

    // Get selected environmental laws from general information
    const selectedEnvironmentalLaws = formData.general?.environmental_laws || [];
    
    // Filter compliance items to only show those matching selected environmental laws
    const filteredComplianceItems = formData.complianceItems.filter(item => {
      const itemLawId = item.lawId || item.law_id || item.law;
      return selectedEnvironmentalLaws.includes(itemLawId);
    });

    // Group filtered items by law citation
    const groupedByLaw = filteredComplianceItems.reduce((acc, item) => {
      const lawCitation = item.lawCitation || item.law_citation || item.lawId || '-';
      if (!acc[lawCitation]) {
        acc[lawCitation] = [];
      }
      acc[lawCitation].push(item);
      return acc;
    }, {});

    // Flatten back to array with merge information
    const result = [];
    Object.keys(groupedByLaw).forEach(lawCitation => {
      const itemsInGroup = groupedByLaw[lawCitation];
      itemsInGroup.forEach((item, index) => {
        result.push({
          ...item,
          lawCitation,
          isFirstInGroup: index === 0,
          rowspan: index === 0 ? itemsInGroup.length : 0
        });
      });
    });

    return result;
  }, [formData?.complianceItems, formData?.general?.environmental_laws]);

  const fetchInspectionData = useCallback(async () => {
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
  }, [id, notifications]);

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
  }, [mode, id, location.state, navigate, notifications, fetchInspectionData]);

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
    
    // Determine compliance from form data
    if (formData) {
      const complianceItems = formData.complianceItems || [];
      const systems = formData.systems || [];
      
      const hasNonCompliantItems = complianceItems.some(item => item.compliant === 'No');
      const hasNonCompliantSystems = systems.some(system => system.nonCompliant);
      
      if (hasNonCompliantItems || hasNonCompliantSystems) {
        return 'NON_COMPLIANT';
      }
      
      const hasCompliantItems = complianceItems.some(item => item.compliant === 'Yes');
      const hasCompliantSystems = systems.some(system => system.compliant);
      
      if (hasCompliantItems || hasCompliantSystems) {
        return 'COMPLIANT';
      }
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
    const complianceStatus = getComplianceStatus();
    
    const payload = {
      form_data: {
        ...formData,
        is_draft: false,
        completed_at: new Date().toISOString()
      },
      compliance_decision: complianceStatus === 'COMPLIANT' ? 'COMPLIANT' : 'NON_COMPLIANT'
    };

    await api.post(`/api/inspections/${id}/complete/`, payload);
    notifications.success(`Inspection submitted as ${complianceStatus === 'COMPLIANT' ? 'Compliant' : 'Non-Compliant'}!`);
    navigate('/inspections');
  };

  const handleReviewAction = async () => {
    const endpoints = {
      approve_unit: `/api/inspections/${id}/submit-for-review/`,
      approve_section: `/api/inspections/${id}/send-to-next-level/`,
      approve_division: `/api/inspections/${id}/close/`,
      forward_legal: `/api/inspections/${id}/forward-to-legal/`,
      send_nov: `/api/inspections/${id}/send-nov/`,
      send_noo: `/api/inspections/${id}/send-noo/`,
      reject: `/api/inspections/${id}/return-inspection/`,
      mark_compliant: `/api/inspections/${id}/mark-as-compliant/`
    };

    const endpoint = endpoints[actionType];
    if (!endpoint) return;

    // Prepare payload with compliance status and recommendations
    const payload = { 
      remarks: remarks.trim(),
      compliance_status: complianceStatus,
    };
    
    // Include recommendations for non-compliant inspections
    if (complianceStatus === 'NON_COMPLIANT' && recommendations.checked) {
      payload.recommendations = recommendations.checked;
    }

    await api.post(endpoint, payload);
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

  // Build confirmation message
  const getConfirmationMessage = () => {
    if (mode === 'preview') {
      return (
        <div className="space-y-3">
          <p>Are you sure you want to submit this inspection for review?</p>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <p className="font-medium mb-2">Compliance Status:</p>
            <p className={`font-bold ${complianceStatus === 'COMPLIANT' ? 'text-green-700' : 'text-red-700'}`}>
              {complianceStatus === 'COMPLIANT' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
            </p>
          </div>
          {complianceStatus === 'NON_COMPLIANT' && recommendations.checked && recommendations.checked.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-medium text-yellow-900 mb-2">Recommendations:</p>
              <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                {recommendations.checked.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
              {recommendations.otherText && (
                <p className="text-sm text-yellow-800 mt-2">
                  <span className="font-medium">Additional: </span>
                  {recommendations.otherText}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    // Review mode messages
    let actionMessage = '';
    if (actionType === 'approve_unit') {
      actionMessage = complianceStatus === 'COMPLIANT' 
        ? 'This will mark the inspection as Unit Completed - Compliant and send to Section Chief for review.'
        : 'This will mark the inspection as Unit Completed - Non-Compliant and send to Section Chief for review.';
    } else if (actionType === 'approve_section') {
      actionMessage = complianceStatus === 'COMPLIANT'
        ? 'This will mark the inspection as Section Completed - Compliant and send to Division Chief.'
        : 'This will mark the inspection as Section Completed - Non-Compliant and send to Division Chief.';
    } else if (actionType === 'approve_division') {
      actionMessage = 'This will close the inspection and finalize it.';
    } else if (actionType === 'mark_compliant') {
      actionMessage = 'This will mark the inspection as Closed - Compliant and finalize it.';
    } else if (actionType === 'forward_legal') {
      actionMessage = 'This will forward the case to Legal Unit for further action.';
    } else if (actionType === 'reject') {
      actionMessage = 'This will return the inspection to the previous level for revision.';
    } else if (actionType === 'send_nov') {
      actionMessage = 'This will send a Notice of Violation to the establishment.';
    } else if (actionType === 'send_noo') {
      actionMessage = 'This will send a Notice of Order to the establishment.';
    }

    return (
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="font-medium mb-2">Action Summary:</p>
          <p className="text-gray-700">{actionMessage}</p>
        </div>
        
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="font-medium mb-2">Compliance Status:</p>
          <p className={`font-bold ${complianceStatus === 'COMPLIANT' ? 'text-green-700' : 'text-red-700'}`}>
            {complianceStatus === 'COMPLIANT' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
          </p>
        </div>

        {complianceStatus === 'NON_COMPLIANT' && recommendations.checked && recommendations.checked.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-medium text-yellow-900 mb-2">Recommendations:</p>
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              {recommendations.checked.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
            {recommendations.otherText && (
              <p className="text-sm text-yellow-800 mt-2">
                <span className="font-medium">Additional: </span>
                {recommendations.otherText}
              </p>
            )}
          </div>
        )}

        {mode !== 'preview' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (required):</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              rows="4"
              placeholder="Enter your remarks here..."
              required
            />
          </div>
        )}
      </div>
    );
  };


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
    <LayoutForm headerHeight="medium" inspectionHeader={reviewHeader}>
      <div className="w-full">
        {/* PDF Document Container */}
        <div className="bg-white shadow-lg print:shadow-none" style={{ padding: '10px' }}>
          
          {/* Document Info */}
          <div className="mb-6 text-sm relative">
            <div className="text-center mb-6 relative">
              <h3 className="text-base font-semibold uppercase">
                Inspection Report Summary
              </h3>
              
              {/* Overall Status Badge - Top Right Watermark */}
              <div className={`absolute top-0 right-0 px-3 py-1 rounded text-sm font-semibold opacity-80 ${
                complianceStatus === 'COMPLIANT' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {complianceStatus === 'COMPLIANT' ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Inspection Reference No.:</p>
                <p className="text-gray-700">EIA-2025-0001</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Date Generated:</p>
                <p className="text-gray-700">{formatDate(new Date())}</p>
              </div>
            </div>
          </div>

          {/* I. GENERAL INFORMATION */}
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-2 mb-4">
              I. GENERAL INFORMATION
            </h2>
            
            <div className="space-y-3 text-sm">
              {/* Applicable Environmental Laws */}
              <div>
                <p className="font-semibold text-gray-700 mb-2">
                  Applicable Environmental Laws (check all that apply)
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {general.environmental_laws && general.environmental_laws.length > 0 ? (
                    general.environmental_laws.map(law => (
                      <p key={law} className="text-gray-900">☑ {law}</p>
                    ))
                  ) : (
                    <p className="text-gray-500">No laws selected</p>
                  )}
                </div>
              </div>

              {/* Basic Details Card */}
              <div className="p-3 mt-3 bg-gray-50 rounded-md border border-gray-200 space-y-2.5">
                <div>
                  <p className="font-semibold text-gray-700">Name of Establishment</p>
                  <p className="text-gray-900 mt-1">{general.establishment_name || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-semibold text-gray-700">Address</p>
                    <p className="text-gray-900 mt-1">{general.address || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Coordinates (Decimal)</p>
                    <p className="text-gray-900 mt-1">{general.coordinates || '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Nature of Business</p>
                  <p className="text-gray-900 mt-1">{general.nature_of_business || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-semibold text-gray-700">Year Established</p>
                    <p className="text-gray-900 mt-1">{general.year_established || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Inspection Date & Time</p>
                    <p className="text-gray-900 mt-1">{general.inspection_date_time ? formatDate(general.inspection_date_time) : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Operating Details Card */}
              <div className="p-3 mt-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="font-semibold text-gray-700">Operating Hours</p>
                    <p className="text-gray-900 mt-1">{general.operating_hours || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Operating Days/Week</p>
                    <p className="text-gray-900 mt-1">{general.operating_days_per_week || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Operating Days/Year</p>
                    <p className="text-gray-900 mt-1">{general.operating_days_per_year || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Product Lines and Production Rates Card */}
              <div className="p-3 mt-3 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Product Lines and Production Rates</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="font-semibold text-gray-700">Product Lines</p>
                    <p className="text-gray-900 mt-1">{general.productLine || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Production Rate as Declared in The ECC (Unit/day)</p>
                    <p className="text-gray-900 mt-1">{general.declaredProductionRate || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Actual Production Rate (Unit/day)</p>
                    <p className="text-gray-900 mt-1">{general.actualProductionRate || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="p-3 mt-3 bg-gray-50 rounded-md border border-gray-200 space-y-2.5">
                <div>
                  <p className="font-semibold text-gray-700">Name of Managing Head</p>
                  <p className="text-gray-900 mt-1">{general.managing_head || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-semibold text-gray-700">Name of PCO</p>
                    <p className="text-gray-900 mt-1">{general.pco_name || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Name of Person Interviewed, Designation</p>
                    <p className="text-gray-900 mt-1">{general.person_interviewed || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-semibold text-gray-700">PCO Accreditation No.</p>
                    <p className="text-gray-900 mt-1">{general.pco_accreditation_no || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Date of Effectivity</p>
                    <p className="text-gray-900 mt-1">{general.pco_date_effectivity ? formatDateOnly(general.pco_date_effectivity) : '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-semibold text-gray-700">Phone/ Fax No.</p>
                    <p className="text-gray-900 mt-1">{general.phone_fax_no || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Email Address</p>
                    <p className="text-gray-900 mt-1">{general.email_address || '-'}</p>
                  </div>
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
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-1/4">Applicable Laws and Citations</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-1/3">Compliance Requirement</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-20">Status</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {processedComplianceItems && processedComplianceItems.length > 0 ? (
                    processedComplianceItems.map((item, idx) => {
                      // Get the compliance requirement text - this should show the actual requirement
                      const complianceRequirement = item.complianceRequirement || 
                                                   item.compliance_requirement ||
                                                   item.item || 
                                                   item.title || 
                                                   item.compliance_item || 
                                                   item.name || 
                                                   item.requirement ||
                                                   item.description ||
                                                   item.text ||
                                                   `Compliance Item ${idx + 1}`;
                      
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {/* Only render law citation cell for first item in group */}
                          {item.isFirstInGroup && (
                            <td 
                              className="border border-gray-300 px-3 py-2 font-medium text-xs align-top" 
                              rowSpan={item.rowspan}
                            >
                              {item.lawCitation}
                            </td>
                          )}
                          <td className="border border-gray-300 px-3 py-2">
                            {complianceRequirement}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span className="text-black font-medium">
                              {item.compliant === 'Yes' && 'Yes'}
                              {item.compliant === 'No' && 'No'}
                              {item.compliant === 'N/A' && 'N/A'}
                              {!item.compliant && '-'}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {item.compliant === 'No' ? (
                              <div className="space-y-1">
                                {item.remarks && item.remarks.trim() ? (
                                  <div className="text-black">
                                    {item.remarks}
                                  </div>
                                ) : (
                                  <span className="text-black">Non-compliant</span>
                                )}
                              </div>
                            ) : item.compliant === 'Yes' ? (
                              <div className="text-black">
                                {item.remarks && item.remarks.trim() ? item.remarks : 'Compliant'}
                              </div>
                            ) : item.compliant === 'N/A' ? (
                              <span className="text-black">NOT APPLICABLE</span>
                            ) : (
                              <span className="text-black">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="border border-gray-300 px-3 py-4 text-center text-gray-500">
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
                systems.filter(s => s.compliant || s.nonCompliant).map((system, idx) => {
                  // Check for non-compliant items within this system's scope
                  const systemNonCompliantItems = complianceItems.filter(item => 
                    item.lawId === system.lawId && item.compliant === 'No'
                  );
                  const hasNonCompliantItems = systemNonCompliantItems.length > 0;
                  const isNonCompliant = system.nonCompliant || hasNonCompliantItems;
                  const isCompliant = !isNonCompliant && (system.compliant || system.compliant === 'Yes');


                  return (
                    <div key={idx} className="border-l-4 border-gray-300 pl-4">
                      <div className="flex items-start justify-between">
                        <p className="font-semibold">{idx + 1}. {system.system}</p>
                        <span className={`ml-4 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                          isNonCompliant ? 'bg-red-100 text-red-800' : 
                          isCompliant ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {isNonCompliant ? '❌ Non-Compliant' : isCompliant ? '✅ Compliant' : 'N/A'}
                        </span>
                      </div>
                      {isNonCompliant && system.remarks && (
                        <div className="mt-2">
                          <p className="text-gray-700 font-semibold mb-2">Finding:</p>
                          <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-900 min-h-[120px] font-mono text-sm whitespace-pre-wrap">
                            {system.remarks}
                          </div>
                        </div>
                      )}
                      {isCompliant && !isNonCompliant && system.remarks && (
                        <div className="mt-2">
                          <p className="text-gray-700 font-semibold mb-2">Observation:</p>
                          <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-900 min-h-[120px] font-mono text-sm whitespace-pre-wrap">
                            {system.remarks}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
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

          {/* PHOTO DOCUMENTATION - LAST SECTION */}
          {formData.generalFindings && formData.generalFindings.length > 0 && (
            <section className="mb-8 page-break-before">
              <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-2 mb-4">
                {complianceStatus !== 'COMPLIANT' && recommendations.checked && recommendations.checked.length > 0 
                  ? 'VII. PHOTO DOCUMENTATION' 
                  : 'VI. PHOTO DOCUMENTATION'}
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {formData.generalFindings.map((photo, idx) => (
                  <div key={idx} className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                    {/* Photo Image */}
                    <div className="bg-gray-100 flex items-center justify-center" style={{ minHeight: '200px' }}>
                      {photo.preview || photo.url ? (
                        <img 
                          src={photo.preview || photo.url} 
                          alt={photo.caption || `Photo ${idx + 1}`}
                          className="w-full h-auto object-contain"
                          style={{ maxHeight: '300px' }}
                        />
                      ) : (
                        <div className="text-gray-400 text-center p-4">
                          <p className="text-sm font-semibold">Photo {idx + 1}</p>
                          <p className="text-xs mt-1">{photo.name}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Photo Caption/Description */}
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Description:</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {photo.caption || photo.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm print:hidden">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 bg-sky-50 border-b border-sky-200">
                <div className="flex items-center gap-3">
                  {mode === 'preview' ? (
                    <Send className="w-6 h-6 text-sky-600" />
                  ) : (
                    <FileCheck className="w-6 h-6 text-sky-600" />
                  )}
                  <h3 className="text-xl font-semibold text-gray-800">
                    {mode === 'preview' ? 'Confirm Submission' : 'Confirm Action'}
                  </h3>
                </div>
              </div>
              
              {/* Content - scrollable */}
              <div className="p-6 overflow-y-auto flex-1">
                {getConfirmationMessage()}
              </div>
              
              {/* Footer with buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setRemarks('');
                  }}
                  className="px-6 py-2.5 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-2.5 text-white rounded-lg transition-colors flex items-center justify-center min-w-[100px] font-medium disabled:opacity-50 ${
                    complianceStatus === 'COMPLIANT' ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                  disabled={loading || (mode !== 'preview' && !remarks.trim())}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
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

