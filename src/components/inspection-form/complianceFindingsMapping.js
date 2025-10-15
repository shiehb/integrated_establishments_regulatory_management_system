/**
 * Compliance Items to Findings Mapping
 * Maps compliance requirement keywords to corresponding finding systems
 */

export const COMPLIANCE_TO_FINDINGS_MAP = {
  // Air Pollution mappings
  'air pollution': 'Air Pollution Control Facilities',
  'emission': 'Air Pollution Control Facilities',
  'stack': 'Air Pollution Control Facilities',
  'chimney': 'Air Pollution Control Facilities',
  'air quality': 'Air Pollution Control Facilities',
  'poa': 'Air Pollution Control Facilities',
  'permit to operate air': 'Air Pollution Control Facilities',
  
  // Water/Wastewater mappings
  'wastewater': 'Wastewater Treatment Facilities',
  'water pollution': 'Wastewater Treatment Facilities',
  'discharge permit': 'Wastewater Treatment Facilities',
  'effluent': 'Wastewater Treatment Facilities',
  'sewage': 'Wastewater Treatment Facilities',
  'water quality': 'Wastewater Treatment Facilities',
  'wtp': 'Wastewater Treatment Facilities',
  'wwtp': 'Wastewater Treatment Facilities',
  
  // Waste Management mappings
  'waste': 'Solid Waste Management',
  'solid waste': 'Solid Waste Management',
  'waste segregation': 'Solid Waste Management',
  'waste storage': 'Solid Waste Management',
  'waste disposal': 'Solid Waste Management',
  'garbage': 'Solid Waste Management',
  'refuse': 'Solid Waste Management',
  'waste management': 'Solid Waste Management',
  
  // Hazardous Waste mappings
  'hazardous waste': 'Hazardous Waste Management',
  'hazmat': 'Hazardous Waste Management',
  'toxic waste': 'Hazardous Waste Management',
  'chemical waste': 'Hazardous Waste Management',
  'dangerous waste': 'Hazardous Waste Management',
  'hwmf': 'Hazardous Waste Management',
  
  // Chemical Storage mappings
  'chemical': 'Chemical Storage Facilities',
  'chemical storage': 'Chemical Storage Facilities',
  'toxic substance': 'Chemical Storage Facilities',
  'hazardous substance': 'Chemical Storage Facilities',
  
  // PCO mappings
  'pollution control officer': 'Pollution Control Officer',
  'pco': 'Pollution Control Officer',
  'accreditation': 'Pollution Control Officer',
  
  // Self-Monitoring mappings
  'self-monitoring': 'Self-Monitoring Report',
  'smr': 'Self-Monitoring Report',
  'monitoring report': 'Self-Monitoring Report',
  'compliance monitoring': 'Self-Monitoring Report',
  'cmr': 'Self-Monitoring Report',
  
  // ECC mappings
  'environmental compliance': 'Environmental Compliance Certificate',
  'ecc': 'Environmental Compliance Certificate',
  'compliance certificate': 'Environmental Compliance Certificate',
  
  // Emergency Response mappings
  'emergency': 'Emergency Response Plan',
  'contingency': 'Emergency Response Plan',
  'emergency response': 'Emergency Response Plan',
  'spill response': 'Emergency Response Plan'
};

/**
 * Find matching finding system for a compliance item
 * @param {string} complianceRequirement - The compliance requirement text
 * @param {array} systems - Array of finding systems
 * @returns {object|null} - Matching system or null
 */
export function findMatchingSystem(complianceRequirement, systems) {
  if (!complianceRequirement || !systems || systems.length === 0) return null;
  
  const requirementLower = complianceRequirement.toLowerCase();
  
  // Check each mapping keyword
  for (const [keyword, systemName] of Object.entries(COMPLIANCE_TO_FINDINGS_MAP)) {
    if (requirementLower.includes(keyword)) {
      // Find the system with this name
      const matchedSystem = systems.find(s => s.system === systemName);
      if (matchedSystem) {
        return matchedSystem;
      }
    }
  }
  
  return null;
}

/**
 * Get system index from systems array
 */
export function getSystemIndex(systems, systemName) {
  return systems.findIndex(s => s.system === systemName);
}

/**
 * Auto-sync compliance item to finding system
 * @param {object} complianceItem - The compliance item that changed
 * @param {array} systems - Current systems array
 * @returns {array} - Updated systems array
 */
export function autoSyncComplianceToFinding(complianceItem, systems) {
  if (!complianceItem || !systems) return systems;
  
  // Find matching system
  const matchedSystem = findMatchingSystem(complianceItem.complianceRequirement, systems);
  
  if (!matchedSystem) return systems;
  
  const systemIndex = systems.findIndex(s => s.system === matchedSystem.system);
  if (systemIndex === -1) return systems;
  
  // Clone systems array
  const updatedSystems = [...systems];
  
  // Sync compliance status
  if (complianceItem.compliant === "Yes") {
    updatedSystems[systemIndex] = {
      ...updatedSystems[systemIndex],
      compliant: "Yes",
      nonCompliant: false,
      remarksOption: "Compliant",
      remarks: "",
      autoSynced: true,
      syncedFrom: complianceItem.complianceRequirement
    };
  } else if (complianceItem.compliant === "No") {
    const currentSystem = updatedSystems[systemIndex];
    const originalAutoSummary = currentSystem.originalAutoSummary || currentSystem.autoSummary || "";
    
    updatedSystems[systemIndex] = {
      ...currentSystem,
      compliant: "No",
      nonCompliant: true,
      remarksOption: complianceItem.remarksOption || "",
      remarks: complianceItem.remarks || "",
      autoSynced: true,
      syncedFrom: complianceItem.complianceRequirement,
      originalAutoSummary: originalAutoSummary // Preserve original content
    };
  }
  
  return updatedSystems;
}

