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

export default function WorkflowStatus({
  inspection,
  userLevel,
  onWorkflowOpen,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const statusColor =
    STATUS_COLORS[inspection.status] || "bg-gray-100 text-gray-800";
  const statusLabel = STATUS_LABELS[inspection.status] || inspection.status;

  const canAct = inspection.can_act;
  const currentAssignee = inspection.current_assignee_name;

  return (
    <div className="space-y-2">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>

        {canAct && (
          <button
            onClick={() => onWorkflowOpen(inspection)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
            type="button"
          >
            Take Action
          </button>
        )}
      </div>

      {/* Current Assignee */}
      {currentAssignee && (
        <div className="text-sm text-gray-600">
          Assigned to: {currentAssignee}
        </div>
      )}

      {/* Workflow Comments */}
      {inspection.workflow_comments && (
        <div className="mt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800"
            type="button"
          >
            {showDetails ? "Hide" : "Show"} Comments
          </button>

          {showDetails && (
            <div className="p-3 mt-2 text-sm text-gray-700 rounded-md bg-gray-50">
              {inspection.workflow_comments}
            </div>
          )}
        </div>
      )}

      {/* Role-specific Information */}
      {inspection.status === "LEGAL_REVIEW" && (
        <div className="p-2 mt-2 rounded-md bg-blue-50">
          <div className="text-sm text-blue-800">
            Legal Unit: Review and create billing record or compliance call
          </div>
        </div>
      )}

      {inspection.status === "DIVISION_CREATED" && (
        <div className="p-2 mt-2 rounded-md bg-purple-50">
          <div className="text-sm text-purple-800">
            Division Chief: Create inspection list and applicable laws
          </div>
        </div>
      )}

      {inspection.status === "SECTION_REVIEW" && (
        <div className="p-2 mt-2 rounded-md bg-yellow-50">
          <div className="text-sm text-yellow-800">
            Section Chief: Review and forward inspection
          </div>
        </div>
      )}

      {inspection.status === "UNIT_REVIEW" && (
        <div className="p-2 mt-2 rounded-md bg-orange-50">
          <div className="text-sm text-orange-800">
            Unit Head: Review and forward to monitoring
          </div>
        </div>
      )}

      {inspection.status === "MONITORING_INSPECTION" && (
        <div className="p-2 mt-2 rounded-md bg-red-50">
          <div className="text-sm text-red-800">
            Monitoring Personnel: Conduct final inspection
          </div>
        </div>
      )}
    </div>
  );
}
