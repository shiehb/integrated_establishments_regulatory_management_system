import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Building
} from "lucide-react";

export default function ComplianceTracking({ inspection, onComplianceDecision }) {
  const [complianceData, setComplianceData] = useState({
    is_compliant: null,
    violations: [],
    compliance_plan: '',
    compliance_date: '',
    penalties: [],
    legal_actions: []
  });

  const [showComplianceForm, setShowComplianceForm] = useState(false);

  useEffect(() => {
    if (inspection.compliance_data) {
      setComplianceData(inspection.compliance_data);
    }
  }, [inspection]);

  const handleComplianceDecision = (isCompliant) => {
    setComplianceData(prev => ({
      ...prev,
      is_compliant: isCompliant
    }));
    setShowComplianceForm(true);
  };

  const handleSubmitCompliance = () => {
    const decisionData = {
      inspection_id: inspection.id,
      is_compliant: complianceData.is_compliant,
      violations: complianceData.violations,
      compliance_plan: complianceData.compliance_plan,
      compliance_date: complianceData.compliance_date,
      penalties: complianceData.penalties,
      legal_actions: complianceData.legal_actions
    };

    if (onComplianceDecision) {
      onComplianceDecision(decisionData);
    }
  };

  const getReturnPath = (isCompliant) => {
    if (isCompliant) {
      return {
        path: "Monitoring → Unit Head → Section Chief → Division Chief → FINAL CLOSE",
        color: "text-green-600",
        icon: CheckCircle
      };
    } else {
      return {
        path: "Monitoring → Unit Head → Section Chief → Division Chief → Legal Unit → LEGAL ACTION",
        color: "text-red-600",
        icon: XCircle
      };
    }
  };

  const returnPath = getReturnPath(complianceData.is_compliant);

  return (
    <div className="space-y-6">
      {/* Compliance Decision */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Decision</h3>
        
        {complianceData.is_compliant === null ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Based on your inspection findings, please determine if the establishment is compliant:
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleComplianceDecision(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Compliant ✅</span>
              </button>
              
              <button
                onClick={() => handleComplianceDecision(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
              >
                <XCircle className="h-5 w-5" />
                <span>Non-Compliant ❌</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {complianceData.is_compliant ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <span className={`text-lg font-semibold ${complianceData.is_compliant ? 'text-green-600' : 'text-red-600'}`}>
                {complianceData.is_compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </span>
            </div>

            {/* Return Path */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Return Path:</h4>
              <div className="flex items-center space-x-2">
                <returnPath.icon className={`h-4 w-4 ${returnPath.color}`} />
                <span className={`text-sm ${returnPath.color}`}>{returnPath.path}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Form */}
      {showComplianceForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {complianceData.is_compliant ? 'Compliance Details' : 'Non-Compliance Details'}
          </h3>

          <div className="space-y-4">
            {!complianceData.is_compliant && (
              <>
                {/* Violations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Violations Found
                  </label>
                  <div className="space-y-2">
                    {[
                      'Environmental Clearance Violation',
                      'Waste Management Non-Compliance',
                      'Air Quality Standards Violation',
                      'Water Quality Standards Violation',
                      'Safety Protocol Violation'
                    ].map(violation => (
                      <label key={violation} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={complianceData.violations.includes(violation)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setComplianceData(prev => ({
                                ...prev,
                                violations: [...prev.violations, violation]
                              }));
                            } else {
                              setComplianceData(prev => ({
                                ...prev,
                                violations: prev.violations.filter(v => v !== violation)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{violation}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Compliance Plan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compliance Plan Required
                  </label>
                  <textarea
                    value={complianceData.compliance_plan}
                    onChange={(e) => setComplianceData(prev => ({
                      ...prev,
                      compliance_plan: e.target.value
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Describe the compliance plan and corrective actions..."
                  />
                </div>

                {/* Compliance Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compliance Deadline
                  </label>
                  <input
                    type="date"
                    value={complianceData.compliance_date}
                    onChange={(e) => setComplianceData(prev => ({
                      ...prev,
                      compliance_date: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Penalties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penalties & Fines
                  </label>
                  <div className="space-y-2">
                    {[
                      'Warning Notice',
                      'Administrative Fine',
                      'Suspension of Operations',
                      'Revocation of Permit',
                      'Legal Action'
                    ].map(penalty => (
                      <label key={penalty} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={complianceData.penalties.includes(penalty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setComplianceData(prev => ({
                                ...prev,
                                penalties: [...prev.penalties, penalty]
                              }));
                            } else {
                              setComplianceData(prev => ({
                                ...prev,
                                penalties: prev.penalties.filter(p => p !== penalty)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{penalty}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setShowComplianceForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCompliance}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                  complianceData.is_compliant 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {complianceData.is_compliant ? 'Submit Compliance' : 'Submit Non-Compliance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Actions (for Legal Unit) */}
      {inspection.status === 'LEGAL_REVIEW' && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Actions</h3>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Notice of Violation (NOV)</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Send Notice of Violation requiring compliance plan and deadline.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Notice of Order (NOO)</h4>
                  <p className="text-sm text-red-700 mt-1">
                    If establishment does not comply, send Notice of Order with penalties, fines, and deadlines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
