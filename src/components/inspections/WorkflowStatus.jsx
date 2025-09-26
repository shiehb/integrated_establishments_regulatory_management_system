import { useState } from "react";

const STATUS_COLORS = {
  PENDING: "bg-gray-100 text-gray-800",
  LEGAL_REVIEW: "bg-blue-100 text-blue-800",
  DIVISION_CREATED: "bg-purple-100 text-purple-800",
  SECTION_REVIEW: "bg-yellow-100 text-yellow-800",
  UNIT_REVIEW: "bg-orange-100 text-orange-800",
  MONITORING_INSPECTION: "bg-red-100 text-red-800",
  COMPLETED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  LEGAL_REVIEW: "Legal Review",
  DIVISION_CREATED: "Division Created",
  SECTION_REVIEW: "Section Review",
  UNIT_REVIEW: "Unit Review",
  MONITORING_INSPECTION: "Monitoring Inspection",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export default function WorkflowStatus({ inspection, userLevel, onWorkflowOpen }) {
  const [showDetails, setShowDetails] = useState(false);

  const statusColor = STATUS_COLORS[inspection.status] || "bg-gray-100 text-gray-800";
  const statusLabel = STATUS_LABELS[inspection.status] || inspection.status;

  const canAct = inspection.can_act;
  const currentAssignee = inspection.current_assignee_name;

  const getRoleIcon = (role) => {
    const icons = {
      "Legal Unit": "⚖️",
      "Division Chief": "👔",
      "Section Chief": "📋",
      "Unit Head": "🔍",
      "Monitoring Personnel": "📊",
    };
    return icons[role] || "👤";
  };

  const getNextStage = () => {
    const stages = [
      "PENDING",
      "LEGAL_REVIEW", 
      "DIVISION_CREATED",
      "SECTION_REVIEW",
      "UNIT_REVIEW",
      "MONITORING_INSPECTION",
      "COMPLETED"
    ];
    
    const currentIndex = stages.indexOf(inspection.status);
    if (currentIndex < stages.length - 1) {
      return STATUS_LABELS[stages[currentIndex + 1]];
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
        
        {canAct && (
          <button
            onClick={() => onWorkflowOpen(inspection)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Take Action
          </button>
        )}
      </div>

      {/* Current Assignee */}
      {currentAssignee && (
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">👤</span>
          <span>Assigned to: {currentAssignee}</span>
        </div>
      )}

      {/* Workflow Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="text-gray-800">
            {inspection.status === "COMPLETED" ? "100%" : 
             inspection.status === "REJECTED" ? "Stopped" :
             `${Math.round((Object.keys(STATUS_LABELS).indexOf(inspection.status) / (Object.keys(STATUS_LABELS).length - 2)) * 100)}%`}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              inspection.status === "COMPLETED" ? "bg-green-500" :
              inspection.status === "REJECTED" ? "bg-red-500" :
              "bg-blue-500"
            }`}
            style={{
              width: inspection.status === "COMPLETED" ? "100%" :
                     inspection.status === "REJECTED" ? "100%" :
                     `${Math.round((Object.keys(STATUS_LABELS).indexOf(inspection.status) / (Object.keys(STATUS_LABELS).length - 2)) * 100)}%`
            }}
          />
        </div>
      </div>

      {/* Next Stage */}
      {getNextStage() && inspection.status !== "COMPLETED" && inspection.status !== "REJECTED" && (
        <div className="text-sm text-gray-600">
          Next: {getNextStage()}
        </div>
      )}

      {/* Workflow Comments */}
      {inspection.workflow_comments && (
        <div className="mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showDetails ? "Hide" : "Show"} Comments
          </button>
          
          {showDetails && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
              {inspection.workflow_comments}
            </div>
          )}
        </div>
      )}

      {/* Role-specific Information */}
      {inspection.status === "LEGAL_REVIEW" && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <div className="flex items-center text-sm text-blue-800">
            <span className="mr-2">⚖️</span>
            <span>Legal Unit: Review and create billing record or compliance call</span>
          </div>
        </div>
      )}

      {inspection.status === "DIVISION_CREATED" && (
        <div className="mt-3 p-3 bg-purple-50 rounded-md">
          <div className="flex items-center text-sm text-purple-800">
            <span className="mr-2">👔</span>
            <span>Division Chief: Create inspection list and applicable laws</span>
          </div>
        </div>
      )}

      {inspection.status === "SECTION_REVIEW" && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
          <div className="flex items-center text-sm text-yellow-800">
            <span className="mr-2">📋</span>
            <span>Section Chief: Review and forward inspection</span>
          </div>
        </div>
      )}

      {inspection.status === "UNIT_REVIEW" && (
        <div className="mt-3 p-3 bg-orange-50 rounded-md">
          <div className="flex items-center text-sm text-orange-800">
            <span className="mr-2">🔍</span>
            <span>Unit Head: Review and forward to monitoring</span>
          </div>
        </div>
      )}

      {inspection.status === "MONITORING_INSPECTION" && (
        <div className="mt-3 p-3 bg-red-50 rounded-md">
          <div className="flex items-center text-sm text-red-800">
            <span className="mr-2">📊</span>
            <span>Monitoring Personnel: Conduct final inspection</span>
          </div>
        </div>
      )}

      {/* Assignment Chain */}
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Assignment Chain</h4>
        <div className="space-y-1 text-xs text-gray-600">
          {inspection.assigned_legal_unit_name && (
            <div className="flex items-center">
              <span className="mr-2">⚖️</span>
              <span>Legal: {inspection.assigned_legal_unit_name}</span>
            </div>
          )}
          {inspection.assigned_division_head_name && (
            <div className="flex items-center">
              <span className="mr-2">👔</span>
              <span>Division: {inspection.assigned_division_head_name}</span>
            </div>
          )}
          {inspection.assigned_section_chief_name && (
            <div className="flex items-center">
              <span className="mr-2">📋</span>
              <span>Section: {inspection.assigned_section_chief_name}</span>
            </div>
          )}
          {inspection.assigned_unit_head_name && (
            <div className="flex items-center">
              <span className="mr-2">🔍</span>
              <span>Unit: {inspection.assigned_unit_head_name}</span>
            </div>
          )}
          {inspection.assigned_monitor_name && (
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              <span>Monitor: {inspection.assigned_monitor_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
