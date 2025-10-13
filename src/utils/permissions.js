// Permission checking utilities for role-based access control

// Check if user can view inspection tracking timeline
export const canViewInspectionTracking = (userLevel) => {
  // Only Admin users can view the inspection tracking timeline
  return userLevel === 'Admin';
};

// Check if user can perform actions on inspections
export const canUserPerformActions = (userLevel) => {
  // Admin users can view all inspections but cannot perform any actions
  return userLevel !== 'Admin';
};

// Check if user has specific role
export const hasRole = (userLevel, requiredRoles) => {
  if (!userLevel || !requiredRoles || requiredRoles.length === 0) {
    return false;
  }
  
  // Check direct role match first
  if (requiredRoles.includes(userLevel)) {
    return true;
  }
  
  // For Admin role, they can access everything except specific exclusions
  if (userLevel === 'Admin') {
    return true;
  }
  
  return false;
};

// Check if user can access a specific feature
export const canAccessFeature = (userLevel, feature) => {
  const featurePermissions = {
    'inspection_tracking': ['Admin'],
    'create_inspection': ['Division Chief'],
    'edit_inspection': ['Division Chief', 'Section Chief', 'Unit Head', 'Monitoring Personnel'],
    'review_inspection': ['Division Chief', 'Section Chief', 'Unit Head'],
    'manage_users': ['Admin'],
    'system_config': ['Admin'],
    'database_backup': ['Admin'],
    'billing_records': ['Legal Unit'],
    'district_management': ['Admin', 'Section Chief', 'Unit Head'],
  };
  
  const allowedRoles = featurePermissions[feature] || [];
  return hasRole(userLevel, allowedRoles);
};

// Get user's accessible features
export const getUserAccessibleFeatures = (userLevel) => {
  const allFeatures = [
    'inspection_tracking',
    'create_inspection', 
    'edit_inspection',
    'review_inspection',
    'manage_users',
    'system_config',
    'database_backup',
    'billing_records',
    'district_management'
  ];
  
  return allFeatures.filter(feature => canAccessFeature(userLevel, feature));
};

// Check if user can see inspection details
export const canViewInspectionDetails = (userLevel, inspectionStatus, assignedUserId, currentUserId) => {
  // Admin can see all inspections
  if (userLevel === 'Admin') {
    return true;
  }
  
  // User can see inspections assigned to them
  if (assignedUserId === currentUserId) {
    return true;
  }
  
  // Role-based visibility rules
  const visibilityRules = {
    'Division Chief': ['CREATED', 'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT', 'DIVISION_REVIEWED'],
    'Section Chief': ['SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT', 'UNIT_REVIEWED', 'SECTION_REVIEWED'],
    'Unit Head': ['UNIT_ASSIGNED', 'UNIT_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT', 'UNIT_REVIEWED'],
    'Monitoring Personnel': ['MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS'],
    'Legal Unit': ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']
  };
  
  const allowedStatuses = visibilityRules[userLevel] || [];
  return allowedStatuses.includes(inspectionStatus);
};
