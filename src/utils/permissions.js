/**
 * Check if user can access export/print functionality
 * @param {string} userLevel - The user's role/level
 * @param {string} module - The module name (e.g., 'billing', 'users', 'inspections', 'establishments')
 * @returns {boolean}
 */
export const canExportAndPrint = (userLevel, module = '') => {
  // Users List: ONLY Admin can export/print
  if (module === 'users') {
    return userLevel === 'Admin';
  }
  
  // Billing: ONLY Legal Unit can export/print
  if (module === 'billing') {
    return userLevel === 'Legal Unit';
  }
  
  // Establishments & Inspections: Admin and Division Chief can export/print
  if (module === 'establishments' || module === 'inspections') {
    return userLevel === 'Admin' || userLevel === 'Division Chief';
  }
  
  // Default: deny access
  return false;
};
