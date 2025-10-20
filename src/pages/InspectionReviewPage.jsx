import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationManager';
import api from '../services/api';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Send, FileCheck, Printer, Edit, X, UserCheck, Users, Building, CheckSquare, Scale, Mail, FileText, CornerDownLeft, Camera } from 'lucide-react';
import LayoutForm from '../components/LayoutForm';
import { getButtonVisibility as getRoleStatusButtonVisibility, canUserAccessInspection } from '../utils/roleStatusMatrix';
import ImageLightbox from '../components/inspection-form/ImageLightbox';

const InspectionReviewPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, loading: userLoading } = useAuth();
  const notifications = useNotifications();
  
  const urlParams = new URLSearchParams(location.search);
  const mode = urlParams.get('mode') || 'review';
  const reviewApproval = urlParams.get('reviewApproval') === 'true';
  
  console.log('🔍 InspectionReviewPage loaded with:', {
    id,
    mode,
    reviewApproval,
    search: location.search,
    state: location.state
  });
  
  const [inspectionData, setInspectionData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState('');
  
  // Image lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Process compliance items for merged law citations (moved to top level)
  const processedComplianceItems = useMemo(() => {
    if (!formData?.complianceItems || formData.complianceItems.length === 0) {
      console.log('No compliance items found in formData:', formData);
      return [];
    }

    // Get selected environmental laws from general information (like in inspection form)
    const selectedEnvironmentalLaws = formData.general?.environmental_laws || [];
    console.log('Selected environmental laws:', selectedEnvironmentalLaws);
    
    // Always include PCO Accreditation and SMR items (like in inspection form)
    const ALWAYS_INCLUDED_LAWS = [
      "DAO 2014-02 or Revised Guidelines on PCO Accreditation",
      "DAO 2014-02",
      "PCO Accreditation",
      "Pollution-Control",
      "DAO 2003-27",
      "Self-Monitoring",
      "SMR"
    ];
    const effectiveLawFilter = [
      ...new Set([...(selectedEnvironmentalLaws || []), ...ALWAYS_INCLUDED_LAWS]),
    ];
    
    // Filter compliance items to only show those matching selected environmental laws + always included laws
    const filteredComplianceItems = formData.complianceItems.filter(item => {
      const itemLawId = item.lawId || item.law_id || item.law;
      const itemLawCitation = item.lawCitation || item.law_citation;
      
      // Check if item matches selected laws OR always included laws OR contains related text
      const matchesSelected = effectiveLawFilter.includes(itemLawId);
      const matchesCitation = effectiveLawFilter.includes(itemLawCitation);
      const isPCORelated = itemLawId?.includes('PCO') || 
                          itemLawCitation?.includes('PCO') || 
                          itemLawId?.includes('2014-02') ||
                          itemLawCitation?.includes('2014-02') ||
                          item.complianceRequirement?.includes('PCO') ||
                          item.complianceRequirement?.includes('accreditation');
      const isSMRRelated = itemLawId?.includes('2003-27') ||
                          itemLawCitation?.includes('2003-27') ||
                          itemLawId?.includes('SMR') ||
                          itemLawCitation?.includes('SMR') ||
                          item.complianceRequirement?.includes('SMR') ||
                          item.complianceRequirement?.includes('Self-Monitoring') ||
                          item.complianceRequirement?.includes('monitoring report');
      
      return matchesSelected || matchesCitation || isPCORelated || isSMRRelated;
    });
    
    console.log('Filtered compliance items:', filteredComplianceItems);

    // Group filtered items by law citation
    const groupedByLaw = filteredComplianceItems.reduce((acc, item) => {
      const lawCitation = item.lawCitation || item.law_citation || item.lawId || item.law || '-';
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
  }, [formData]);

  const fetchInspectionData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching inspection data for ID:', id);
      const response = await api.get(`inspections/${id}/`);
      console.log('📦 API Response:', response.data);
      console.log('📋 Form data:', response.data.form);
      console.log('✅ Checklist:', response.data.form?.checklist);
      
      setInspectionData(response.data);
      
      // Set form data from checklist, or create empty structure if needed
      const checklist = response.data.form?.checklist;
      if (checklist && Object.keys(checklist).length > 0) {
        console.log('✓ Using checklist data:', checklist);
        setFormData(checklist);
      } else {
        console.warn('⚠️ No checklist data, using empty structure');
        // Initialize with empty structure to prevent rendering issues
        setFormData({
          general: {},
          purpose: {},
          permits: [],
          complianceItems: [],
          systems: [],
          recommendationState: {}
        });
      }
    } catch (error) {
      console.error('❌ Error fetching inspection:', error);
      notifications.error(`Failed to load inspection data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state when ID changes
  useEffect(() => {
    setInspectionData(null);
    setFormData(null);
  }, [id]);

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
  }, [mode, fetchInspectionData]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Function to open lightbox with images
  const openLightbox = (images, index = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Removed unused functions - navigation is handled directly in buttons



  const handleReviewAction = async () => {
    const endpoints = {
      approve_unit: `inspections/${id}/review_and_forward_unit/`,
      approve_section: `inspections/${id}/review_and_forward_section/`,
      review_division: `inspections/${id}/review_division/`,
      approve_division: `inspections/${id}/close/`,
      forward_legal: `inspections/${id}/forward_to_legal/`,
      send_nov: `inspections/${id}/send_nov/`,
      send_noo: `inspections/${id}/send_noo/`,
      reject: `inspections/${id}/return_to_division/`,
      mark_compliant: `inspections/${id}/close/`,
      save_and_submit: `inspections/${id}/complete/`,
      save_and_approve: `inspections/${id}/complete/`
    };

    let endpoint = endpoints[actionType];
    if (!endpoint) {
      notifications.error('Invalid action type');
      return;
    }

    // Prepare payload based on action type
    let payload = {};
    if (actionType === 'mark_compliant') {
      payload = { final_status: 'CLOSED_COMPLIANT' };
    } else if (actionType === 'forward_legal') {
      payload = { remarks: 'Forwarded to Legal Unit for enforcement' };
    } else if (actionType === 'approve_unit') {
      payload = { remarks: 'Unit Head approved and forwarded to Section Chief' };
    } else if (actionType === 'approve_section') {
      payload = { remarks: 'Section Chief approved and forwarded to Division Chief' };
    } else if (actionType === 'review_division') {
      payload = { remarks: 'Division Chief reviewed and marked as DIVISION_REVIEWED' };
    } else if (actionType === 'save_and_submit') {
      // Complete inspection from preview
      const userLevel = currentUser?.userlevel;
      const complianceDecision = getComplianceStatus();
      
      console.log('🔍 Save & Submit debug:', {
        userLevel,
        actionType,
        endpoint,
        complianceDecision,
        formData: !!formData
      });
      
      payload = {
        form_data: formData,
        compliance_decision: complianceDecision,
        violations_found: [],
        findings_summary: 'Inspection completed',
        remarks: `Inspection completed by ${userLevel}`
      };
    } else if (actionType === 'save_and_approve') {
      // Complete inspection and approve from preview (after edit from review)
      // Role-specific approval based on current user
      const userLevel = currentUser?.userlevel;
      const complianceDecision = getComplianceStatus();
      
      if (userLevel === 'Unit Head') {
        // Unit Head approving - use review_and_forward_unit endpoint
        endpoint = `inspections/${id}/review_and_forward_unit/`;
        payload = {
          form_data: formData,
          compliance_decision: complianceDecision,
          remarks: 'Unit Head approved and forwarded to Section Chief'
        };
      } else if (userLevel === 'Section Chief') {
        // Section Chief approving - use review_and_forward_section endpoint
        endpoint = `inspections/${id}/review_and_forward_section/`;
        payload = {
          form_data: formData,
          compliance_decision: complianceDecision,
          remarks: 'Section Chief approved and forwarded to Division Chief'
        };
      } else if (userLevel === 'Division Chief') {
        // Division Chief approving - use close endpoint
        endpoint = `inspections/${id}/close/`;
        payload = {
          form_data: formData,
          compliance_decision: complianceDecision,
          final_status: complianceDecision === 'COMPLIANT' ? 'CLOSED_COMPLIANT' : 'LEGAL_REVIEW',
          remarks: 'Division Chief approved and closed'
        };
      } else {
        // Fallback to complete endpoint
        payload = {
          form_data: formData,
          compliance_decision: complianceDecision,
          violations_found: [],
          findings_summary: 'Inspection completed and approved',
          remarks: 'Inspection completed and approved by reviewer'
        };
      }
    }

    try {
      console.log('🚀 Making API call:', { endpoint, payload });
      await api.post(endpoint, payload);
      notifications.success('Action completed successfully!');
      setShowConfirm(false);
      navigate('/inspections');
    } catch (error) {
      console.error('❌ Error executing review action:', error);
      console.error('❌ Error response:', error.response?.data);
      notifications.error(
        error.response?.data?.error || error.response?.data?.message || 'Action failed'
      );
    }
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

  if (!inspectionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No inspection data available</p>
          <p className="text-gray-500 text-sm mb-4">The inspection could not be loaded. Please try again.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-white bg-sky-600 hover:bg-sky-700 rounded-md"
          >
            Go Back
          </button>
        </div>
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

  // Get button visibility using unified role-status matrix
  const getButtonVisibility = () => {
    const userLevel = currentUser?.userlevel;
    const status = inspectionData?.current_status;
    
    // Check if we're in preview mode
    const isPreviewMode = mode === 'preview';
    
    // Check if user can access this inspection
    const canAccess = canUserAccessInspection(userLevel, status);
    if (!canAccess) {
      console.warn(`🚫 User ${userLevel} cannot access inspection with status ${status}`);
      return {
        showCloseButton: false,
        showBackButton: false,
        showSaveSubmitButton: false
      };
    }
    
    // Get button visibility from unified role-status matrix
    const roleStatusConfig = getRoleStatusButtonVisibility(userLevel, status, isPreviewMode, null, reviewApproval);
    
    console.log('🔍 InspectionReviewPage button visibility debug:', {
      userLevel,
      status,
      isPreviewMode,
      reviewApproval,
      canAccess,
      roleStatusConfig
    });

    return {
      showCloseButton: roleStatusConfig.showClose,
      showBackButton: roleStatusConfig.showBack,
      showSaveSubmitButton: !isPreviewMode || reviewApproval || (isPreviewMode && roleStatusConfig.showBack) // Show Save & Submit in preview mode for in-progress statuses or when reviewApproval is true
    };
  };

  const buttonVisibility = getButtonVisibility();


  // Custom header for review page
  const reviewHeader = (
    <div className="bg-white border-b border-gray-300 shadow-sm print:hidden">
      <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Title */}
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-sky-700">
              {mode === 'preview' ? 'Integrated Compliance Inspection Report - Preview' : 'Integrated Compliance Inspection Report - Review'}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {mode === 'preview' ? (
              <>
                {/* Preview Mode: Use unified button visibility logic */}
                {buttonVisibility.showBackButton && (
                  <button
                    onClick={() => {
                      const status = inspectionData?.current_status;
                      const inProgressStatuses = ['SECTION_IN_PROGRESS', 'UNIT_IN_PROGRESS', 'MONITORING_IN_PROGRESS'];
                      const completedStatuses = [
                        'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
                        'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
                        'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
                      ];
                      const reviewedStatuses = ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED'];
                      
                      if (inProgressStatuses.includes(status)) {
                        // For in-progress statuses, go to form without review parameters
                        navigate(`/inspections/${id}/form`);
                      } else if (completedStatuses.includes(status) || reviewedStatuses.includes(status)) {
                        // For completed and reviewed statuses, go to form with review parameters
                        navigate(`/inspections/${id}/form?returnTo=review&reviewMode=true`);
                      } else {
                        // For all other statuses, go to form with review parameters
                        navigate(`/inspections/${id}/form?returnTo=review&reviewMode=true`);
                      }
                    }}
                    className="flex items-center px-3 py-1 text-sm text-black bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </button>
                )}
                {buttonVisibility.showCloseButton && (
                <button
                  onClick={() => navigate('/inspections')}
                    className="flex items-center px-3 py-1 text-sm text-black bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Close
                </button>
                )}
                {buttonVisibility.showSaveSubmitButton && (
                <button
                  onClick={() => handleActionClick(reviewApproval ? 'save_and_approve' : 'save_and_submit')}
                  className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                  disabled={loading}
                >
                  <FileCheck className="w-4 h-4 mr-1" />
                  {reviewApproval ? 'Save & Approve' : 'Save & Submit'}
                </button>
                )}
              </>
            ) : mode === 'review' ? (
              <>
                {/* Review Mode: Show Edit Inspection and Approve buttons */}
                <button
                  onClick={() => navigate('/inspections')}
                  className="flex items-center px-3 py-1 text-sm text-black bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Close
                </button>
                {/* Hide Edit Inspection button for Division Chief */}
                {currentUser?.userlevel !== 'Division Chief' && (
                <button
                  onClick={() => navigate(`/inspections/${id}/form?returnTo=review&reviewMode=true`)}
                  className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Inspection
                </button>
                )}
                {/* Show Approve button based on user role and status */}
                {!userLoading && currentUser?.userlevel === 'Unit Head' && 
                 (inspectionData?.current_status === 'MONITORING_COMPLETED_COMPLIANT' || 
                  inspectionData?.current_status === 'MONITORING_COMPLETED_NON_COMPLIANT') && (
                  <button
                    onClick={() => handleActionClick('approve_unit')}
                    className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                    disabled={loading}
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                )}
                {!userLoading && currentUser?.userlevel === 'Section Chief' && 
                 (inspectionData?.current_status === 'UNIT_COMPLETED_COMPLIANT' || 
                  inspectionData?.current_status === 'UNIT_COMPLETED_NON_COMPLIANT' ||
                  inspectionData?.current_status === 'UNIT_REVIEWED' ||
                  inspectionData?.current_status === 'MONITORING_COMPLETED_COMPLIANT' ||
                  inspectionData?.current_status === 'MONITORING_COMPLETED_NON_COMPLIANT') && (
                  <button
                    onClick={() => handleActionClick('approve_section')}
                    className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                    disabled={loading}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                )}
                {!userLoading && currentUser?.userlevel === 'Division Chief' && 
                 (inspectionData?.current_status === 'SECTION_COMPLETED_COMPLIANT' || 
                  inspectionData?.current_status === 'SECTION_COMPLETED_NON_COMPLIANT' ||
                  inspectionData?.current_status === 'SECTION_REVIEWED' ||
                  inspectionData?.current_status === 'DIVISION_REVIEWED') && (
                  <>
                    {/* For SECTION_REVIEWED and SECTION_COMPLETED_* statuses */}
                    {(inspectionData?.current_status === 'SECTION_REVIEWED' ||
                      inspectionData?.current_status === 'SECTION_COMPLETED_COMPLIANT' ||
                      inspectionData?.current_status === 'SECTION_COMPLETED_NON_COMPLIANT') && (
                      <>
                        {/* Always show "Reviewed" button for these statuses */}
                        <button
                          onClick={() => handleActionClick('review_division')}
                          className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Reviewed
                        </button>
                        
                        {/* Show compliance-based action button */}
                        {complianceStatus === 'COMPLIANT' ? (
                          <button
                            onClick={() => handleActionClick('mark_compliant')}
                            className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                            disabled={loading}
                          >
                            <CheckSquare className="w-4 h-4 mr-1" />
                            Mark as Compliant
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActionClick('forward_legal')}
                            className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                            disabled={loading}
                          >
                            <Scale className="w-4 h-4 mr-1" />
                            Send to Legal
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* For DIVISION_REVIEWED status - only show compliance action */}
                    {inspectionData?.current_status === 'DIVISION_REVIEWED' && (
                      <>
                        {complianceStatus === 'COMPLIANT' ? (
                          <button
                            onClick={() => handleActionClick('mark_compliant')}
                            className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                            disabled={loading}
                          >
                            <CheckSquare className="w-4 h-4 mr-1" />
                            Mark as Compliant
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActionClick('forward_legal')}
                            className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                            disabled={loading}
                          >
                            <Scale className="w-4 h-4 mr-1" />
                            Send to Legal
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    );

  // Show loading state if data is not ready
  if (loading || !inspectionData || !formData) {
    return (
      <LayoutForm headerHeight="small">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inspection data...</p>
          </div>
        </div>
      </LayoutForm>
    );
  }

  return (
    <LayoutForm headerHeight="small" inspectionHeader={reviewHeader}>
      <div className="w-full">
        {/* PDF Document Container */}
        <div className="bg-white shadow-lg print:shadow-none p-10">
          
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
                <p className="text-gray-700">{inspectionData?.code || 'N/A'}</p>
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
            
            <div className="space-y-4">
              {/* Environmental Laws Section - At Top */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 uppercase mb-3 border-b border-gray-300 pb-2">Applicable Environmental Laws</p>
                <div className="space-y-1 text-sm">
                  {general.environmental_laws && general.environmental_laws.length > 0 ? (
                    general.environmental_laws.map(law => (
                      <p key={law} className="text-gray-900">☑ {law}</p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No laws selected</p>
                  )}
                </div>
              </div>

              {/* Basic and Operating Details Card - Full Width */}
              <div className="border border-gray-300 rounded-lg p-5 bg-gray-50">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Name of Establishment</p>
                  <p className="text-sm text-gray-900 font-medium">{general.establishment_name || '-'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Address</p>
                    <p className="text-sm text-gray-900">{general.address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Coordinates (Decimal)</p>
                    <p className="text-sm text-gray-900">{general.coordinates || '-'}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Nature of Business</p>
                  <p className="text-sm text-gray-900">{general.nature_of_business || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Year Established</p>
                    <p className="text-sm text-gray-900">{general.year_established || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Inspection Date & Time</p>
                    <p className="text-sm text-gray-900">{general.inspection_date_time ? formatDate(general.inspection_date_time) : '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Operating Hours</p>
                    <p className="text-sm text-gray-900">{general.operating_hours || '-'} hours/day</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Operating Days/Week</p>
                    <p className="text-sm text-gray-900">{general.operating_days_per_week || '-'} days</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Operating Days/Year</p>
                    <p className="text-sm text-gray-900">{general.operating_days_per_year || '-'} days</p>
                  </div>
                </div>
              </div>

              {/* Production Details Card - Full Width */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 uppercase mb-3 border-b border-gray-300 pb-2">Production Details</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Product Lines</p>
                    <p className="text-gray-900">{general.product_lines || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Declared Production Rate</p>
                    <p className="text-gray-900">{general.declared_production_rate || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Actual Production Rate</p>
                    <p className="text-gray-900">{general.actual_production_rate || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Personnel and Contact Information Card - Full Width */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 uppercase mb-3 border-b border-gray-300 pb-2">Personnel and Contact Information</p>
                
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Managing Head</p>
                  <p className="text-sm text-gray-900">{general.managing_head || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">PCO Name</p>
                    <p className="text-sm text-gray-900">{general.pco_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Interviewed Person</p>
                    <p className="text-sm text-gray-900">{general.interviewed_person || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">PCO Accreditation No.</p>
                    <p className="text-sm text-gray-900">{general.pco_accreditation_no || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Effectivity Date</p>
                    <p className="text-sm text-gray-900">{general.effectivity_date ? formatDateOnly(general.effectivity_date) : '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Phone/Fax No.</p>
                    <p className="text-sm text-gray-900">{general.phone_fax_no || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Email Address</p>
                    <p className="text-sm text-gray-900">{general.email_address || '-'}</p>
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
                                                   item.conditionNumber ||
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
                              {!item.compliant && 'N/A'}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {item.compliant === 'No' ? (
                              <div className="space-y-1">
                                {item.remarksOption && (
                                  <div className="text-black">
                                    {item.remarksOption}
                                  </div>
                                )}
                                {item.remarks && item.remarks.trim() && (
                                  <div className="text-black text-sm">
                                    <span className="font-medium">Details: </span>{item.remarks}
                                  </div>
                                )}
                                {!item.remarksOption && !item.remarks && (
                                  <span className="text-black">Non-compliant</span>
                                )}
                              </div>
                            ) : item.compliant === 'Yes' ? (
                              <span className="text-black">Compliant</span>
                            ) : (
                              <span className="text-black">Not Applicable</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                        No compliance items recorded
                        {formData && (
                          <div className="text-xs mt-2">
                            Debug: formData.complianceItems = {JSON.stringify(formData.complianceItems)}
                          </div>
                        )}
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

                      {/* Display finding images if available */}
                      {formData.findingImages && formData.findingImages[system.system] && formData.findingImages[system.system].length > 0 && (
                        <div className="mt-3">
                          <p className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Photo Documentation:
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {formData.findingImages[system.system].slice(0, 4).map((img, imgIdx) => (
                              <button
                                key={img.id || imgIdx}
                                onClick={() => openLightbox(formData.findingImages[system.system], imgIdx)}
                                className="w-16 h-16 rounded-md overflow-hidden border border-gray-300 hover:border-sky-500 transition-colors"
                              >
                                {img.type === 'application/pdf' ? (
                                  <div className="w-full h-full bg-red-50 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-red-600" />
                                  </div>
                                ) : (
                                  <img 
                                    src={img.url} 
                                    alt={img.caption || img.name || `Photo ${imgIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </button>
                            ))}
                            {formData.findingImages[system.system].length > 4 && (
                              <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium border border-gray-300">
                                +{formData.findingImages[system.system].length - 4}
                              </div>
                            )}
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

          {/* VII. PHOTO DOCUMENTATION */}
          {formData.generalFindings && Array.isArray(formData.generalFindings) && formData.generalFindings.length > 0 && (
            <section className="mb-8 page-break-before">
              <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-2 mb-4">
                VII. PHOTO DOCUMENTATION
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                {formData.generalFindings.map((doc, idx) => (
                  <div key={idx} className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => openLightbox(formData.generalFindings, idx)}>
                    {doc.url && doc.url.toLowerCase().endsWith('.pdf') ? (
                      <div className="aspect-square bg-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="w-16 h-16 mx-auto text-red-600" />
                          <p className="text-xs text-gray-600 mt-2">PDF Document</p>
                        </div>
                      </div>
                    ) : doc.url ? (
                      <img 
                        src={doc.url} 
                        alt={doc.caption || `Photo ${idx + 1}`}
                        className="w-full aspect-square object-cover hover:scale-105 transition-transform"
                      />
                    ) : null}
                    {doc.caption && (
                      <div className="p-3">
                        <p className="text-xs text-gray-700">{doc.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {formData.generalFindings.length === 0 && (
                <p className="text-sm text-gray-500 italic">No photo documentation uploaded</p>
              )}
            </section>
          )}

        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 print:hidden">
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">
                {actionType === 'save_and_submit' ? 'Confirm Save & Submit' :
                 actionType === 'save_and_approve' ? 'Confirm Save & Approve' :
                 actionType === 'mark_compliant' ? 'Mark as Compliant' :
                 actionType === 'forward_legal' ? 'Send to Legal' :
                 actionType === 'approve_unit' ? 'Approve & Forward' :
                 actionType === 'approve_section' ? 'Approve & Forward' :
                 'Confirm Action'}
              </h3>
              
              <p className="text-gray-700 mb-4">
                {actionType === 'save_and_submit' 
                  ? 'This will complete the inspection and change its status to completed. Please ensure all information is correct before proceeding.'
                  : actionType === 'save_and_approve' 
                    ? 'This will save the inspection changes and approve it for the next review level. Please ensure all information is correct before proceeding.'
                    : actionType === 'mark_compliant' 
                      ? 'This will mark the inspection as compliant and close the case. The establishment will be considered in full compliance.'
                      : actionType === 'forward_legal' 
                        ? 'This will forward the inspection to the Legal Unit for enforcement action. The case will be marked for legal review.'
                        : actionType === 'approve_unit' 
                          ? 'This will approve the inspection and forward it to the Section Chief for review.'
                          : actionType === 'approve_section' 
                            ? 'This will approve the inspection and forward it to the Division Chief for review.'
                            : 'Are you sure you want to proceed with this action?'
                }
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewAction}
                  className="px-4 py-2 text-white bg-sky-600 rounded-md hover:bg-sky-700 font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 
                   actionType === 'save_and_submit' ? 'Save & Submit' :
                   actionType === 'save_and_approve' ? 'Save & Approve' :
                   actionType === 'mark_compliant' ? 'Mark as Compliant' :
                   actionType === 'forward_legal' ? 'Send to Legal' :
                   actionType === 'approve_unit' ? 'Approve & Forward' :
                   actionType === 'approve_section' ? 'Approve & Forward' :
                   'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}

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

