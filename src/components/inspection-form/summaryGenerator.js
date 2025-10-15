/**
 * Summary Generator for Findings
 * Generates comprehensive summaries from compliance items
 */

/**
 * Format a single compliance item for non-compliant summary
 */
function formatNonCompliantItem(item, number) {
  let formatted = "";
  
  if (item.conditionNumber) {
    // PD-1586 format (has condition numbers)
    formatted += `${number}. Condition ${item.conditionNumber}: ${item.complianceRequirement || 'N/A'}\n`;
  } else {
    // Other laws format (has citations)
    formatted += `${number}. ${item.lawCitation || 'Citation N/A'}\n`;
    formatted += `   Requirement: ${item.complianceRequirement || 'N/A'}\n`;
  }
  
  // Add remark
  const remark = item.remarksOption === "Other" 
    ? (item.remarks || 'No remarks provided')
    : (item.remarksOption || 'No remarks provided');
  formatted += `   Remark: ${remark}\n\n`;
  
  return formatted;
}

/**
 * Format a single compliance item for compliant summary
 */
function formatCompliantItem(item, number) {
  let formatted = "";
  
  if (item.conditionNumber) {
    // PD-1586 format
    formatted += `${number}. Condition ${item.conditionNumber}: ${item.complianceRequirement || 'N/A'}\n`;
  } else {
    // Other laws format
    formatted += `${number}. ${item.lawCitation || 'Citation N/A'}\n`;
    formatted += `   Requirement: ${item.complianceRequirement || 'N/A'}\n`;
  }
  
  formatted += `   Status: Compliant\n\n`;
  return formatted;
}

/**
 * Generate summary for compliant items only
 */
export function generateCompliantSummary(compliantItems, lawName) {
  if (!compliantItems || compliantItems.length === 0) return "";
  
  let summary = `COMPLIANT ITEMS - ${lawName}:\n\n`;
  
  compliantItems.forEach((item, idx) => {
    summary += formatCompliantItem(item, idx + 1);
  });
  
  return summary;
}

/**
 * Generate summary for non-compliant items only
 */
export function generateNonCompliantSummary(nonCompliantItems, lawName) {
  if (!nonCompliantItems || nonCompliantItems.length === 0) return "";
  
  let summary = `NON-COMPLIANT ITEMS - ${lawName}:\n\n`;
  
  nonCompliantItems.forEach((item, idx) => {
    summary += formatNonCompliantItem(item, idx + 1);
  });
  
  return summary;
}

/**
 * Generate summary focusing ONLY on non-compliant items
 */
export function generateCompleteSummary(compliantItems, nonCompliantItems, lawName) {
  let summary = "";
  
  // Show ONLY non-compliant items (focus on non-compliance)
  if (nonCompliantItems && nonCompliantItems.length > 0) {
    summary += generateNonCompliantSummary(nonCompliantItems, lawName);
    summary += "\n";
    
    // Footer for additional observations
    summary += "────────────────────────────\n";
    summary += "Additional Observations:\n\n";
  }
  
  // If no non-compliant items but there are compliant items, show a note
  else if (compliantItems && compliantItems.length > 0) {
    summary += `COMPLIANT STATUS - ${lawName}:\n\n`;
    summary += "All related compliance items are marked as compliant.\n\n";
    summary += "────────────────────────────\n";
    summary += "Additional Observations:\n\n";
  }
  
  return summary;
}

/**
 * Determine system status based on related compliance items
 */
export function determineSystemStatus(relatedComplianceItems) {
  if (!relatedComplianceItems || relatedComplianceItems.length === 0) {
    return {
      status: "Not Evaluated",
      compliant: "",
      nonCompliant: false,
      hasCompliant: false,
      hasNonCompliant: false
    };
  }
  
  const hasYes = relatedComplianceItems.some(item => item.compliant === "Yes");
  const hasNo = relatedComplianceItems.some(item => item.compliant === "No");
  
  if (hasNo) {
    // ANY non-compliant → Mark as Non-Compliant
    return {
      status: "Non-Compliant",
      compliant: "No",
      nonCompliant: true,
      hasCompliant: hasYes,
      hasNonCompliant: true
    };
  } else if (hasYes) {
    // All compliant → Mark as Compliant
    return {
      status: "Compliant",
      compliant: "Yes",
      nonCompliant: false,
      hasCompliant: true,
      hasNonCompliant: false
    };
  } else {
    // Items exist but not marked
    return {
      status: "Not Evaluated",
      compliant: "",
      nonCompliant: false,
      hasCompliant: false,
      hasNonCompliant: false
    };
  }
}

/**
 * Get law full name from lawId
 */
export function getLawFullName(lawId) {
  const lawNames = {
    'PD-1586': 'Presidential Decree No. 1586 - Environmental Impact Statement System',
    'RA-8749': 'Republic Act No. 8749 - Philippine Clean Air Act',
    'RA-9275': 'Republic Act No. 9275 - Philippine Clean Water Act',
    'RA-9003': 'Republic Act No. 9003 - Ecological Solid Waste Management Act',
    'RA-6969': 'Republic Act No. 6969 - Toxic Substances and Hazardous and Nuclear Wastes Control Act',
    'RA-9729': 'Republic Act No. 9729 - Climate Change Act',
    'RA-10121': 'Republic Act No. 10121 - Philippine Disaster Risk Reduction and Management Act',
    'Pollution-Control': 'Pollution Control Officer Accreditation',
    'Self-Monitoring': 'Self-Monitoring Report'
  };
  
  return lawNames[lawId] || lawId;
}

/**
 * Main function: Generate auto-summary for a finding system
 */
export function generateAutoSummaryForSystem(complianceItems, systemName, lawId) {
  // Filter items that belong to this system and law
  const relatedItems = complianceItems.filter(item => {
    if (item.lawId !== lawId) return false;
    
    // Use keyword matching to see if this item relates to the system
    const requirement = (item.complianceRequirement || "").toLowerCase();
    const systemLower = systemName.toLowerCase();
    
    // For PD-1586 / ECC, all items relate to "Environmental Impact Statement System"
    if (lawId === 'PD-1586' && systemName.includes('Environmental Impact Statement')) {
      return true;
    }
    
    // For other laws, check if requirement mentions system keywords
    if (systemLower.includes('air') && requirement.includes('air')) return true;
    if (systemLower.includes('water') && (requirement.includes('water') || requirement.includes('wastewater'))) return true;
    if (systemLower.includes('waste') && requirement.includes('waste')) return true;
    if (systemLower.includes('chemical') && requirement.includes('chemical')) return true;
    if (systemLower.includes('hazardous') && requirement.includes('hazardous')) return true;
    
    return false;
  });
  
  if (relatedItems.length === 0) {
    return { summary: "", status: { status: "Not Evaluated", compliant: "", nonCompliant: false } };
  }
  
  // Separate compliant and non-compliant items
  const compliantItems = relatedItems.filter(item => item.compliant === "Yes");
  const nonCompliantItems = relatedItems.filter(item => item.compliant === "No");
  
  // Determine status
  const status = determineSystemStatus(relatedItems);
  
  // Generate summary
  const lawName = getLawFullName(lawId);
  const summary = generateCompleteSummary(compliantItems, nonCompliantItems, lawName);
  
  return { summary, status, relatedItemsCount: relatedItems.length };
}

/**
 * Update multiple systems with auto-summaries
 */
export function updateSystemsWithAutoSummaries(systems, complianceItems) {
  return systems.map(system => {
    // Generate auto-summary for this system
    const { summary, status, relatedItemsCount } = generateAutoSummaryForSystem(
      complianceItems,
      system.system,
      system.lawId
    );
    
    // Only update if there are related compliance items
    if (relatedItemsCount > 0) {
      return {
        ...system,
        compliant: status.compliant,
        nonCompliant: status.nonCompliant,
        autoSummary: summary,
        originalAutoSummary: summary, // Preserve original for read-only protection
        autoSummaryActive: true,
        autoSynced: true,
        syncedFrom: `${relatedItemsCount} compliance item(s)`
      };
    }
    
    return system;
  });
}

