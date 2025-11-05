import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, AlertCircle, Calendar, Clock } from "lucide-react";
import { getQuarterlyEvaluations, evaluateQuarter } from "../../../services/api";
import { QUARTERS, LAWS } from "../../../constants/quotaConstants";
import ConfirmationDialog from "../../common/ConfirmationDialog";

const QuarterlySummaryCard = ({ quarter, year, law = null, userRole = null, onEvaluationComplete }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState(null);

  const canEvaluate = ['Admin', 'Division Chief'].includes(userRole);

  useEffect(() => {
    fetchEvaluation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quarter, year, law]);

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      const params = { year, quarter };
      if (law) params.law = law;
      
      const evaluations = await getQuarterlyEvaluations(params);
      // If law-specific, get the first evaluation; otherwise aggregate all
      if (law && evaluations.length > 0) {
        setEvaluation(evaluations[0]);
      } else if (!law && evaluations.length > 0) {
        // Aggregate all laws for this quarter
        const aggregated = {
          quarterly_target: evaluations.reduce((sum, e) => sum + e.quarterly_target, 0),
          quarterly_achieved: evaluations.reduce((sum, e) => sum + e.quarterly_achieved, 0),
          surplus: evaluations.reduce((sum, e) => sum + e.surplus, 0),
          deficit: evaluations.reduce((sum, e) => sum + e.deficit, 0),
          quarter_status: evaluations.every(e => e.quarter_status === 'ACHIEVED' || e.quarter_status === 'EXCEEDED') 
            ? 'ACHIEVED' 
            : 'NOT_ACHIEVED',
          evaluated_at: evaluations[0]?.evaluated_at,
          evaluations_count: evaluations.length
        };
        setEvaluation(aggregated);
      } else {
        setEvaluation(null);
      }
    } catch (err) {
      console.error('Error fetching evaluation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!law) {
      setError('Cannot evaluate: law is required');
      return;
    }

    setEvaluating(true);
    try {
      await evaluateQuarter({ law, year, quarter });
      await fetchEvaluation();
      if (onEvaluationComplete) {
        onEvaluationComplete();
      }
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Error evaluating quarter:', err);
      setError(err.message || 'Failed to evaluate quarter');
    } finally {
      setEvaluating(false);
    }
  };

  const getStatusIcon = () => {
    if (!evaluation) return null;
    
    switch (evaluation.quarter_status) {
      case 'ACHIEVED':
      case 'EXCEEDED':
        return <CheckCircle2 size={20} className="text-green-600" />;
      case 'NOT_ACHIEVED':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    if (!evaluation) return 'text-gray-600';
    
    switch (evaluation.quarter_status) {
      case 'ACHIEVED':
        return 'text-green-600';
      case 'EXCEEDED':
        return 'text-green-700';
      case 'NOT_ACHIEVED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = () => {
    if (!evaluation) return 'Not Evaluated';
    
    switch (evaluation.quarter_status) {
      case 'ACHIEVED':
        return '✅ Achieved';
      case 'EXCEEDED':
        return '✅ Exceeded';
      case 'NOT_ACHIEVED':
        return '❌ Not Achieved';
      default:
        return 'Not Evaluated';
    }
  };

  const percentage = evaluation && evaluation.quarterly_target > 0
    ? Math.round((evaluation.quarterly_achieved / evaluation.quarterly_target) * 100)
    : 0;

  if (loading) {
    return (
      <div className="border border-gray-300 p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-sky-600" />
          <h4 className="font-semibold text-gray-800">
            {QUARTERS.find(q => q.value === quarter)?.label} {year} Summary
            {law && ` - ${LAWS.find(l => l.id === law)?.name}`}
          </h4>
        </div>
        {canEvaluate && !evaluation && (
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white rounded transition-colors"
            disabled={!law}
          >
            Evaluate Quarter
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {evaluation ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Target</div>
              <div className="text-lg font-semibold text-gray-800">
                {evaluation.quarterly_target.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Achieved</div>
              <div className="text-lg font-semibold text-gray-800">
                {evaluation.quarterly_achieved.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            {getStatusIcon()}
            <span className={`font-semibold ${getStatusColor()}`}>
              {getStatusBadge()}
            </span>
            <span className="text-sm text-gray-600">({percentage}%)</span>
          </div>

          {(evaluation.surplus > 0 || evaluation.deficit > 0) && (
            <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
              {evaluation.surplus > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={14} />
                  <span className="text-xs">Surplus: +{evaluation.surplus.toLocaleString()}</span>
                </div>
              )}
              {evaluation.deficit > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown size={14} />
                  <span className="text-xs">Deficit: -{evaluation.deficit.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {evaluation.evaluated_at && (
            <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t border-gray-200">
              <Clock size={12} />
              <span>Evaluated on {new Date(evaluation.evaluated_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">Quarter not yet evaluated</p>
          {canEvaluate && law && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="mt-2 px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded transition-colors"
            >
              Evaluate Now
            </button>
          )}
        </div>
      )}

      <ConfirmationDialog
        open={showConfirmDialog}
        title="Evaluate Quarter"
        message={
          <div>
            <p className="mb-2">
              You are about to evaluate {QUARTERS.find(q => q.value === quarter)?.label} {year}
              {law && ` for ${LAWS.find(l => l.id === law)?.name}`}.
            </p>
            <p className="text-sm text-gray-600">
              This will calculate totals, determine status, and archive the quarter.
            </p>
          </div>
        }
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleEvaluate}
        confirmText="Evaluate"
        cancelText="Cancel"
        confirmColor="sky"
        loading={evaluating}
        icon={<Calendar size={20} className="text-sky-600" />}
        headerColor="sky"
        size="md"
      />
    </div>
  );
};

export default QuarterlySummaryCard;

