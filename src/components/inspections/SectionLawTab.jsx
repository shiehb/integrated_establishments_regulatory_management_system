import { useState, useEffect } from "react";
import { 
  Building, 
  MapPin, 
  Users, 
  FileText, 
  Calendar,
  Plus,
  Eye,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SectionLawTab({ userLevel, onAdd, onView, onWorkflow }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSectionData();
  }, []);

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      // Mock data for sections with inspection counts
      const mockSections = [
        {
          id: 'PD-1586',
          code: 'PD-1586',
          name: 'EIA Monitoring',
          description: 'Environmental Impact Assessment Monitoring',
          total_inspections: 15,
          pending: 3,
          in_progress: 5,
          completed: 7,
          establishments: [
            { id: 1, name: 'ABC Manufacturing Corp.', district: 'La Union - 1st District', inspections: 2 },
            { id: 2, name: 'XYZ Industries Inc.', district: 'La Union - 2nd District', inspections: 1 }
          ]
        },
        {
          id: 'RA-8749',
          code: 'RA-8749',
          name: 'Air Quality Monitoring',
          description: 'Clean Air Act Monitoring',
          total_inspections: 12,
          pending: 2,
          in_progress: 4,
          completed: 6,
          establishments: [
            { id: 3, name: 'DEF Processing Plant', district: 'La Union - 1st District', inspections: 1 },
            { id: 4, name: 'GHI Chemical Plant', district: 'La Union - 2nd District', inspections: 3 }
          ]
        },
        {
          id: 'RA-9275',
          code: 'RA-9275',
          name: 'Water Quality Monitoring',
          description: 'Clean Water Act Monitoring',
          total_inspections: 18,
          pending: 4,
          in_progress: 6,
          completed: 8,
          establishments: [
            { id: 5, name: 'JKL Water Treatment', district: 'La Union - 1st District', inspections: 2 },
            { id: 6, name: 'MNO Industrial Corp.', district: 'La Union - 2nd District', inspections: 1 }
          ]
        },
        {
          id: 'RA-6969',
          code: 'RA-6969',
          name: 'Toxic Chemicals Monitoring',
          description: 'Toxic Substances and Hazardous Waste Monitoring',
          total_inspections: 8,
          pending: 1,
          in_progress: 2,
          completed: 5,
          establishments: [
            { id: 7, name: 'PQR Chemical Corp.', district: 'La Union - 2nd District', inspections: 1 }
          ]
        },
        {
          id: 'RA-9003',
          code: 'RA-9003',
          name: 'Solid Waste Management',
          description: 'Ecological Solid Waste Management Act',
          total_inspections: 10,
          pending: 2,
          in_progress: 3,
          completed: 5,
          establishments: [
            { id: 8, name: 'STU Waste Management', district: 'La Union - 1st District', inspections: 2 }
          ]
        }
      ];

      setSections(mockSections);
    } catch (error) {
      console.error('Error fetching section data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        <span className="ml-2 text-gray-600">Loading sections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sections & Laws Overview</h2>
          <p className="text-sm text-gray-600">Monitor inspections by section/law and establishment</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Inspection</span>
        </button>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{section.code}</p>
                  <p className="text-xs text-gray-500 mt-2">{section.description}</p>
                </div>
                <div className="ml-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sky-600">{section.total_inspections}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">{section.pending}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{section.in_progress}</div>
                  <div className="text-xs text-gray-500">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{section.completed}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
              </div>
            </div>

            {/* Establishments */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Establishments</h4>
              <div className="space-y-2">
                {section.establishments.map((establishment) => (
                  <div key={establishment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{establishment.name}</div>
                        <div className="text-xs text-gray-500">{establishment.district}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{establishment.inspections} inspections</span>
                      <button
                        onClick={() => onView({ 
                          id: establishment.id, 
                          name: establishment.name,
                          section: section.code,
                          section_name: section.name
                        })}
                        className="p-1 text-gray-400 hover:text-sky-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => onView({ section: section.code, section_name: section.name })}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => onAdd({ section: section.code, section_name: section.name })}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded hover:bg-sky-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Inspection</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Sections</p>
              <p className="text-2xl font-semibold text-gray-900">{sections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sections.reduce((sum, section) => sum + section.pending, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sections.reduce((sum, section) => sum + section.in_progress, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sections.reduce((sum, section) => sum + section.completed, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
