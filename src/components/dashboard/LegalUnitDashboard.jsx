import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle,
  Scale,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useLegalStats } from '../../hooks/useInspectionStats';
import LegalSummaryCards from './shared/LegalSummaryCards';
import InspectionReportsTable from './shared/InspectionReportsTable';

export default function LegalUnitDashboard() {
  const navigate = useNavigate();
  const { stats, loading } = useLegalStats();

  return (
    <div>
      {/* Legal Summary Cards */}
      <LegalSummaryCards 
        stats={stats} 
        loading={loading}
      />

      {/* Main Content Grid */}
      <div className='grid grid-cols-5'>
        {/* Left Column (3 columns) */}
        <div className='col-span-3'>
          {/* Quick Actions Section */}
          <div className="bg-white border border-gray-300 p-4 mb-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 flex items-center">
                <CheckCircle size={18} className="text-gray-600 mr-2" />
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/inspections?tab=legal_review')}
                className="p-4 border border-gray-300 hover:bg-gray-50 text-left"
              >
                <Scale className="w-6 h-6 text-orange-600 mb-2" />
                <h4 className="font-semibold text-gray-800">Review Cases</h4>
                <p className="text-sm text-gray-600">Review pending legal cases</p>
              </button>
              <button
                onClick={() => navigate('/inspections?tab=nov_sent')}
                className="p-4 border border-gray-300 hover:bg-gray-50 text-left"
              >
                <FileText className="w-6 h-6 text-orange-600 mb-2" />
                <h4 className="font-semibold text-gray-800">NOV Cases</h4>
                <p className="text-sm text-gray-600">Manage NOV sent cases</p>
              </button>
              <button
                onClick={() => navigate('/inspections?tab=noo_sent')}
                className="p-4 border border-gray-300 hover:bg-gray-50 text-left"
              >
                <AlertCircle className="w-6 h-6 text-orange-600 mb-2" />
                <h4 className="font-semibold text-gray-800">NOO Cases</h4>
                <p className="text-sm text-gray-600">Manage NOO sent cases</p>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Column (2 columns) */}
        <div className='col-span-2'>
          {/* Legal Cases Table */}
          <InspectionReportsTable 
            userLevel="Legal Unit"
            userProfile={null}
          />
        </div>
      </div>
    </div>
  );
}
