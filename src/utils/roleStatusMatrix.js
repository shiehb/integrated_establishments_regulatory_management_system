/**
 * Role-Status Matrix for Inspection Workflow
 * Defines what each role can do with each inspection status
 */

// Define workflow stages
export const WORKFLOW_STAGES = {
  CREATION: 'creation',
  ASSIGNMENT: 'assignment', 
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REVIEW: 'review',
  LEGAL: 'legal',
  CLOSED: 'closed'
};

// Define user roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  DIVISION_CHIEF: 'Division Chief',
  SECTION_CHIEF: 'Section Chief', 
  UNIT_HEAD: 'Unit Head',
  MONITORING_PERSONNEL: 'Monitoring Personnel',
  LEGAL_UNIT: 'Legal Unit'
};

// Define inspection statuses with their workflow stages
export const STATUS_WORKFLOW_MAP = {
  // Creation stage
  'CREATED': WORKFLOW_STAGES.CREATION,
  
  // Assignment stages
  'SECTION_ASSIGNED': WORKFLOW_STAGES.ASSIGNMENT,
  'UNIT_ASSIGNED': WORKFLOW_STAGES.ASSIGNMENT,
  'MONITORING_ASSIGNED': WORKFLOW_STAGES.ASSIGNMENT,
  
  // In Progress stages
  'SECTION_IN_PROGRESS': WORKFLOW_STAGES.IN_PROGRESS,
  'UNIT_IN_PROGRESS': WORKFLOW_STAGES.IN_PROGRESS,
  'MONITORING_IN_PROGRESS': WORKFLOW_STAGES.IN_PROGRESS,
  
  // Completed stages
  'SECTION_COMPLETED_COMPLIANT': WORKFLOW_STAGES.COMPLETED,
  'SECTION_COMPLETED_NON_COMPLIANT': WORKFLOW_STAGES.COMPLETED,
  'UNIT_COMPLETED_COMPLIANT': WORKFLOW_STAGES.COMPLETED,
  'UNIT_COMPLETED_NON_COMPLIANT': WORKFLOW_STAGES.COMPLETED,
  'MONITORING_COMPLETED_COMPLIANT': WORKFLOW_STAGES.COMPLETED,
  'MONITORING_COMPLETED_NON_COMPLIANT': WORKFLOW_STAGES.COMPLETED,
  
  // Review stages
  'UNIT_REVIEWED': WORKFLOW_STAGES.REVIEW,
  'SECTION_REVIEWED': WORKFLOW_STAGES.REVIEW,
  'DIVISION_REVIEWED': WORKFLOW_STAGES.REVIEW,
  
  // Legal stages
  'LEGAL_REVIEW': WORKFLOW_STAGES.LEGAL,
  'NOV_SENT': WORKFLOW_STAGES.LEGAL,
  'NOO_SENT': WORKFLOW_STAGES.LEGAL,
  
  // Closed stages
  'CLOSED_COMPLIANT': WORKFLOW_STAGES.CLOSED,
  'CLOSED_NON_COMPLIANT': WORKFLOW_STAGES.CLOSED
};

// Define role responsibilities for each workflow stage
export const ROLE_STAGE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    [WORKFLOW_STAGES.CREATION]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.ASSIGNMENT]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.IN_PROGRESS]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.COMPLETED]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.REVIEW]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.LEGAL]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.CLOSED]: { canView: true, canEdit: false, canReview: false, canClose: false }
  },
  
  [USER_ROLES.DIVISION_CHIEF]: {
    [WORKFLOW_STAGES.CREATION]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.ASSIGNMENT]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.IN_PROGRESS]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.COMPLETED]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.REVIEW]: { canView: true, canEdit: true, canReview: true, canClose: true },
    [WORKFLOW_STAGES.LEGAL]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.CLOSED]: { canView: true, canEdit: false, canReview: false, canClose: false }
  },
  
  [USER_ROLES.SECTION_CHIEF]: {
    [WORKFLOW_STAGES.CREATION]: { canView: false, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.ASSIGNMENT]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.IN_PROGRESS]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.COMPLETED]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.REVIEW]: { canView: true, canEdit: true, canReview: true, canClose: true },
    [WORKFLOW_STAGES.LEGAL]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.CLOSED]: { canView: true, canEdit: false, canReview: false, canClose: false }
  },
  
  [USER_ROLES.UNIT_HEAD]: {
    [WORKFLOW_STAGES.CREATION]: { canView: false, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.ASSIGNMENT]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.IN_PROGRESS]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.COMPLETED]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.REVIEW]: { canView: true, canEdit: true, canReview: true, canClose: true },
    [WORKFLOW_STAGES.LEGAL]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.CLOSED]: { canView: true, canEdit: false, canReview: false, canClose: false }
  },
  
  [USER_ROLES.MONITORING_PERSONNEL]: {
    [WORKFLOW_STAGES.CREATION]: { canView: false, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.ASSIGNMENT]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.IN_PROGRESS]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.COMPLETED]: { canView: true, canEdit: true, canReview: false, canClose: false },
    [WORKFLOW_STAGES.REVIEW]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.LEGAL]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.CLOSED]: { canView: true, canEdit: false, canReview: false, canClose: false }
  },
  
  [USER_ROLES.LEGAL_UNIT]: {
    [WORKFLOW_STAGES.CREATION]: { canView: false, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.ASSIGNMENT]: { canView: false, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.IN_PROGRESS]: { canView: false, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.COMPLETED]: { canView: false, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.REVIEW]: { canView: true, canEdit: false, canReview: false, canClose: false },
    [WORKFLOW_STAGES.LEGAL]: { canView: true, canEdit: true, canReview: true, canClose: true },
    [WORKFLOW_STAGES.CLOSED]: { canView: true, canEdit: false, canReview: false, canClose: false }
  }
};

// Define specific status-role combinations for button visibility
export const STATUS_ROLE_BUTTON_MATRIX = {
  // Monitoring Personnel specific statuses
  'MONITORING_ASSIGNED': {
    [USER_ROLES.MONITORING_PERSONNEL]: { showDraft: true, showSubmit: true, showClose: true, showBack: false }
  },
  'MONITORING_IN_PROGRESS': {
    [USER_ROLES.MONITORING_PERSONNEL]: { showDraft: true, showSubmit: true, showClose: true, showBack: false }
  },
  'MONITORING_COMPLETED_COMPLIANT': {
    [USER_ROLES.MONITORING_PERSONNEL]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  'MONITORING_COMPLETED_NON_COMPLIANT': {
    [USER_ROLES.MONITORING_PERSONNEL]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  
  // Unit Head specific statuses
  'UNIT_ASSIGNED': {
    [USER_ROLES.UNIT_HEAD]: { showDraft: true, showSubmit: true, showClose: true, showBack: false }
  },
  'UNIT_IN_PROGRESS': {
    [USER_ROLES.UNIT_HEAD]: { showDraft: true, showSubmit: true, showClose: true, showBack: false }
  },
  'UNIT_COMPLETED_COMPLIANT': {
    [USER_ROLES.UNIT_HEAD]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  'UNIT_COMPLETED_NON_COMPLIANT': {
    [USER_ROLES.UNIT_HEAD]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  
  // Section Chief specific statuses
  'SECTION_ASSIGNED': {
    [USER_ROLES.SECTION_CHIEF]: { showDraft: true, showSubmit: true, showClose: true, showBack: false }
  },
  'SECTION_IN_PROGRESS': {
    [USER_ROLES.SECTION_CHIEF]: { showDraft: true, showSubmit: true, showClose: true, showBack: false }
  },
  'SECTION_COMPLETED_COMPLIANT': {
    [USER_ROLES.SECTION_CHIEF]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  'SECTION_COMPLETED_NON_COMPLIANT': {
    [USER_ROLES.SECTION_CHIEF]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  
  // Review statuses - different behavior for different roles
  'UNIT_REVIEWED': {
    [USER_ROLES.UNIT_HEAD]: { showDraft: false, showSubmit: false, showClose: true, showBack: false },
    [USER_ROLES.SECTION_CHIEF]: { showDraft: false, showSubmit: false, showClose: true, showBack: false },
    [USER_ROLES.DIVISION_CHIEF]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  'SECTION_REVIEWED': {
    [USER_ROLES.SECTION_CHIEF]: { showDraft: false, showSubmit: false, showClose: true, showBack: false },
    [USER_ROLES.DIVISION_CHIEF]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  'DIVISION_REVIEWED': {
    [USER_ROLES.DIVISION_CHIEF]: { showDraft: false, showSubmit: false, showClose: true, showBack: false },
    [USER_ROLES.LEGAL_UNIT]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  
  // Legal statuses
  'LEGAL_REVIEW': {
    [USER_ROLES.LEGAL_UNIT]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  'NOV_SENT': {
    [USER_ROLES.LEGAL_UNIT]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  'NOO_SENT': {
    [USER_ROLES.LEGAL_UNIT]: { showDraft: false, showSubmit: false, showClose: true, showBack: false }
  },
  
  // Closed statuses
  'CLOSED_COMPLIANT': {
    [USER_ROLES.ADMIN]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.DIVISION_CHIEF]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.SECTION_CHIEF]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.UNIT_HEAD]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.MONITORING_PERSONNEL]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.LEGAL_UNIT]: { showDraft: false, showSubmit: false, showClose: false, showBack: false }
  },
  'CLOSED_NON_COMPLIANT': {
    [USER_ROLES.ADMIN]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.DIVISION_CHIEF]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.SECTION_CHIEF]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.UNIT_HEAD]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.MONITORING_PERSONNEL]: { showDraft: false, showSubmit: false, showClose: false, showBack: false },
    [USER_ROLES.LEGAL_UNIT]: { showDraft: false, showSubmit: false, showClose: false, showBack: false }
  }
};

/**
 * Get button visibility based on role, status, and mode
 * @param {string} userRole - Current user's role
 * @param {string} status - Current inspection status
 * @param {boolean} isPreviewMode - Whether in preview mode
 * @param {string} returnTo - Return parameter from URL
 * @param {boolean} reviewApproval - Whether reviewApproval=true in URL
 * @returns {object} Button visibility configuration
 */
export const getButtonVisibility = (userRole, status, isPreviewMode = false, returnTo = null, reviewApproval = false) => {
  // Get workflow stage for the status
  const workflowStage = STATUS_WORKFLOW_MAP[status];
  if (!workflowStage) {
    console.warn(`Unknown status: ${status}`);
    return { showDraft: false, showSubmit: false, showClose: false, showBack: false, isReadOnly: true };
  }
  
  // Get role permissions for this workflow stage
  const rolePermissions = ROLE_STAGE_PERMISSIONS[userRole];
  if (!rolePermissions) {
    console.warn(`Unknown user role: ${userRole}`);
    return { showDraft: false, showSubmit: false, showClose: false, showBack: false, isReadOnly: true };
  }
  
  const stagePermissions = rolePermissions[workflowStage];
  if (!stagePermissions) {
    console.warn(`No permissions defined for role ${userRole} in stage ${workflowStage}`);
    return { showDraft: false, showSubmit: false, showClose: false, showBack: false, isReadOnly: true };
  }
  
  // Get specific button configuration for this status-role combination
  const statusRoleConfig = STATUS_ROLE_BUTTON_MATRIX[status]?.[userRole];
  
  // Base configuration
  let config = {
    showDraft: false,
    showSubmit: false,
    showClose: false,
    showBack: false,
    isReadOnly: !stagePermissions.canEdit
  };
  
  // Apply specific status-role configuration if available
  if (statusRoleConfig) {
    config = { ...config, ...statusRoleConfig };
  } else {
    // Fallback to stage permissions
    config.showDraft = stagePermissions.canEdit && !isPreviewMode;
    config.showSubmit = stagePermissions.canEdit && !isPreviewMode;
    config.showClose = stagePermissions.canView;
  }
  
  // Handle preview mode
  if (isPreviewMode) {
    // Special case: If reviewApproval=true, always show Back button regardless of status
    if (reviewApproval) {
      config.showBack = true;
      config.showClose = false;
    } else {
      // In preview mode, show Back button for in-progress stages, Close button for review/legal stages
      if (workflowStage === WORKFLOW_STAGES.IN_PROGRESS) {
        config.showBack = true;
        config.showClose = false;
      } else if (workflowStage === WORKFLOW_STAGES.REVIEW || workflowStage === WORKFLOW_STAGES.LEGAL) {
        config.showBack = false;
        config.showClose = true;
      }
    }
    
    // Always disable draft and submit in preview mode
    config.showDraft = false;
    config.showSubmit = false;
    config.isReadOnly = true;
  }
  
  // Handle returnTo parameter and reviewMode
  if (returnTo === 'review') {
    // When returnTo=review, we're in form mode coming from review
    // Show Back button to go back to preview mode
    config.showBack = true;
    config.showClose = false;
    config.showSubmit = stagePermissions.canEdit;
    config.showDraft = false;
  }
  
  return config;
};

/**
 * Check if user can access inspection based on role and status
 * @param {string} userRole - Current user's role
 * @param {string} status - Current inspection status
 * @returns {boolean} Whether user can access the inspection
 */
export const canUserAccessInspection = (userRole, status) => {
  const workflowStage = STATUS_WORKFLOW_MAP[status];
  if (!workflowStage) return false;
  
  const rolePermissions = ROLE_STAGE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  
  const stagePermissions = rolePermissions[workflowStage];
  return stagePermissions?.canView || false;
};
