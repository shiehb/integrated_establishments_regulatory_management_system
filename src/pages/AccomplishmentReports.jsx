// src/pages/AccomplishmentReports.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LayoutWithSidebar from '../components/LayoutWithSidebar';
import CompletedInspectionsList from '../components/reports/CompletedInspectionsList';
import ReportsList from '../components/reports/ReportsList';
import ExportModal from '../components/reports/ExportModal';
import AccomplishmentReportPDF from '../components/reports/AccomplishmentReportPDF';
import DivisionChiefAccomplishmentReport from '../components/reports/DivisionChiefAccomplishmentReport';
import { getCurrentQuarter, getQuarterDates, exportInspectionsPDF } from '../services/reportsApi';
import { getInspections } from '../services/api';
import { Download, Building, CheckCircle, XCircle, TrendingUp, Search, Filter, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';

export default function AccomplishmentReports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inspections');
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const current = getCurrentQuarter();
    return current.quarter;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const current = getCurrentQuarter();
    return current.year;
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    complianceRate: 0
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [lawFilter, setLawFilter] = useState([]);
  const [cityFilter, setCityFilter] = useState([]);
  const [provinceFilter, setProvinceFilter] = useState([]);
  const [complianceFilter, setComplianceFilter] = useState([]);
  const [currentPage] = useState(1);
  const [pageSize] = useState(20);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportError, setExportError] = useState(null);

  // Stable callback for summary change
  const handleSummaryChange = useCallback((stats) => {
    setSummaryStats(stats);
  }, []);

  // Helper function for compliance status
  const getComplianceStatus = (inspection) => {
    if (inspection.form?.compliance_decision === 'COMPLIANT') {
      return { status: 'COMPLIANT', color: 'text-green-600 bg-green-50' };
    } else if (inspection.form?.compliance_decision === 'NON_COMPLIANT') {
      return { status: 'NON_COMPLIANT', color: 'text-red-600 bg-red-50' };
    }
    return { status: 'PENDING', color: 'text-gray-600 bg-gray-50' };
  };

  // Fetch inspections data
  const fetchInspections = useCallback(async () => {
    setLoading(true);
    try {
      const quarterDates = getQuarterDates(selectedQuarter, selectedYear);
      const params = {
        page: 1,
        page_size: 1000, // Get all inspections for the quarter
        date_from: quarterDates.start,
        date_to: quarterDates.end,
        tab: 'completed' // Get completed inspections that the user inspected
      };
      
      // Debug: Let's see what parameters we're sending
      console.log('=== DEBUGGING ACCOMPLISHMENT REPORT ===');
      console.log('API Parameters:', params);
      console.log('Current user:', {
        id: user?.id,
        email: user?.email,
        first_name: user?.first_name,
        last_name: user?.last_name
      });
      
      const data = await getInspections(params);
      
      console.log('Total inspections from API:', data.results?.length || 0);
      
      // Filter for completed inspections AND inspected by current user
      const completedInspections = data.results?.filter(inspection => {
        const status = inspection.current_status;
        const isCompleted = status?.includes('COMPLETED') || 
               status?.includes('CLOSED') ||
               status === 'SECTION_COMPLETED_COMPLIANT' ||
               status === 'SECTION_COMPLETED_NON_COMPLIANT' ||
               status === 'UNIT_COMPLETED_COMPLIANT' ||
               status === 'UNIT_COMPLETED_NON_COMPLIANT' ||
               status === 'MONITORING_COMPLETED_COMPLIANT' ||
               status === 'MONITORING_COMPLETED_NON_COMPLIANT' ||
               status === 'CLOSED_COMPLIANT' ||
               status === 'CLOSED_NON_COMPLIANT';
        
        // Check if current user is the one who inspected it - simplified logic
        const isInspectedByCurrentUser = inspection.form?.inspected_by === user?.id;
        
        // Debug logging
        console.log(`Inspection ${inspection.code}:`, {
          status,
          isCompleted,
          form_inspected_by: inspection.form?.inspected_by,
          current_user_id: user?.id,
          isInspectedByCurrentUser
        });
        
        return isCompleted && isInspectedByCurrentUser;
      }) || [];
      
      console.log(`Final result: ${completedInspections.length} inspections for user ${user?.email}`);
      setInspections(completedInspections);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }, [selectedQuarter, selectedYear, user?.id, user?.email, user?.first_name, user?.last_name]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = inspections.filter(inspection => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const establishmentNames = inspection.establishments_detail?.map(est => est.name).join(' ') || '';
        if (!establishmentNames.toLowerCase().includes(searchLower) && 
            !inspection.code?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Law filter
      if (lawFilter.length > 0 && !lawFilter.includes(inspection.law)) {
        return false;
      }

      // City filter
      if (cityFilter.length > 0) {
        const inspectionCities = inspection.establishments_detail?.map(est => est.city) || [];
        if (!cityFilter.some(city => inspectionCities.includes(city))) {
          return false;
        }
      }

      // Province filter
      if (provinceFilter.length > 0) {
        const inspectionProvinces = inspection.establishments_detail?.map(est => est.province) || [];
        if (!provinceFilter.some(province => inspectionProvinces.includes(province))) {
          return false;
        }
      }

      // Compliance filter
      if (complianceFilter.length > 0) {
        const compliance = getComplianceStatus(inspection);
        if (!complianceFilter.includes(compliance.status)) {
          return false;
        }
      }

      return true;
    });

    // Sort data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'code':
            aValue = a.code || '';
            bValue = b.code || '';
            break;
          case 'establishment':
            aValue = a.establishments_detail?.[0]?.name || '';
            bValue = b.establishments_detail?.[0]?.name || '';
            break;
          case 'law':
            aValue = a.law || '';
            bValue = b.law || '';
            break;
          case 'date':
            aValue = new Date(a.updated_at || 0);
            bValue = new Date(b.updated_at || 0);
            break;
          case 'compliance':
            aValue = getComplianceStatus(a).status;
            bValue = getComplianceStatus(b).status;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [inspections, searchQuery, lawFilter, cityFilter, provinceFilter, complianceFilter, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // Get unique values for filters
  const availableLaws = [...new Set(inspections.map(inspection => inspection.law).filter(Boolean))].sort();
  const availableCities = [...new Set(inspections.flatMap(inspection => 
    inspection.establishments_detail?.map(est => est.city).filter(Boolean) || []
  ))].sort();
  const availableProvinces = [...new Set(inspections.flatMap(inspection => 
    inspection.establishments_detail?.map(est => est.province).filter(Boolean) || []
  ))].sort();
  const availableCompliance = ['COMPLIANT', 'NON_COMPLIANT', 'PENDING'];

  // Fetch data when component mounts or quarter/year changes
  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  // Check if user has access
  const allowedUserLevels = ['Division Chief', 'Section Chief', 'Unit Head', 'Monitoring Personnel'];
  if (!allowedUserLevels.includes(user?.userlevel)) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access Accomplishment Reports.</p>
          </div>
        </div>
      </LayoutWithSidebar>
    );
  }

  const handleQuarterChange = (quarter) => {
    setSelectedQuarter(quarter);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };



  const handleExport = async (exportOptions) => {
    setExportError(null);
    try {
      const params = {
        quarter: selectedQuarter,
        year: selectedYear,
        date_from: exportOptions.customDateRange ? exportOptions.dateFrom : null,
        date_to: exportOptions.customDateRange ? exportOptions.dateTo : null
      };
      
      console.log('Exporting PDF with params:', params);
      console.log('Summary stats:', summaryStats);
      
      const blob = await exportInspectionsPDF(params);
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty PDF generated. Please check your data.');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accomplishment_report_${getQuarterLabel(selectedQuarter).toLowerCase().replace(' ', '_')}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error.message || 'Export failed. Please try again.');
    }
  };

  // const getQuarterLabel = () => {
  //   return `Q${selectedQuarter} ${selectedYear}`;
  // };


  const getQuarterLabel = (quarter) => {
    const labels = {
      1: 'First Quarter',
      2: 'Second Quarter', 
      3: 'Third Quarter',
      4: 'Fourth Quarter'
    };
    return labels[quarter] || `Q${quarter}`;
  };

  // Handler functions
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setLawFilter([]);
    setCityFilter([]);
    setProvinceFilter([]);
    setComplianceFilter([]);
    setSearchQuery('');
  };

  const activeFilterCount = lawFilter.length + cityFilter.length + provinceFilter.length + complianceFilter.length;

  return (
    <>
    <Header/>
    <LayoutWithSidebar>
      <div className="p-4 bg-white h-[calc(100vh-160px)]">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-sky-600">Accomplishment Report</h1>
        </div>

        {/* Export Error Display */}
        {exportError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{exportError}</p>
            <button 
              onClick={() => setExportError(null)}
              className="text-red-500 text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Total Inspections Card */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-sky-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Inspections</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
              </div>
            </div>
          </div>

          {/* Compliant Card */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.compliant}</p>
              </div>
            </div>
          </div>

          {/* Non-Compliant Card */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.nonCompliant}</p>
              </div>
            </div>
          </div>

          {/* Compliance Rate Card */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-blue-600">{summaryStats.complianceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Left side controls - Quarter, Year */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quarter Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Quarter:</label>
              <select
                value={selectedQuarter}
                onChange={(e) => handleQuarterChange(parseInt(e.target.value))}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <option value={1}>First Quarter</option>
                <option value={2}>Second Quarter</option>
                <option value={3}>Third Quarter</option>
                <option value={4}>Fourth Quarter</option>
              </select>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Right side controls - Search, Sort, Filters, Export, Print */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute w-4 h-4 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1 pl-10 pr-8 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ArrowUpDown size={14} />
                Sort
                <ChevronDown size={14} />
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 z-20 w-56 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                      Sort Options
                    </div>
                    <div className="mt-2 mb-2">
                      <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Sort by
                      </div>
                      {[
                        { key: 'code', label: 'Inspection Code' },
                        { key: 'establishment', label: 'Establishment' },
                        { key: 'law', label: 'Law' },
                        { key: 'date', label: 'Date' },
                        { key: 'compliance', label: 'Compliance' }
                      ].map((field) => (
                        <button
                          key={field.key}
                          onClick={() => handleSort(field.key)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                            sortConfig.key === field.key ? "bg-sky-50 font-medium" : ""
                          }`}
                        >
                          <span>{field.label}</span>
                          {sortConfig.key === field.key && (
                            <div className="flex items-center gap-1">
                              {sortConfig.direction === "asc" ? (
                                <ArrowUp size={14} className="text-sky-600" />
                              ) : (
                                <ArrowDown size={14} className="text-sky-600" />
                              )}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {sortConfig.key && (
                      <>
                        <div className="my-1 border-t border-gray-200"></div>
                        <button
                          onClick={() => setSortConfig({ key: null, direction: null })}
                          className="w-full px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-left"
                        >
                          Clear Sort
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Filters Dropdown */}
            <div className="relative">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Filter size={14} />
                Filters
                <ChevronDown size={14} />
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-sky-600 text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filtersOpen && (
                <div className="absolute right-0 z-20 w-80 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Filters</h3>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-sky-600 hover:text-sky-700"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Law Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Law</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {availableLaws.map(law => (
                          <label key={law} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={lawFilter.includes(law)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setLawFilter([...lawFilter, law]);
                                } else {
                                  setLawFilter(lawFilter.filter(l => l !== law));
                                }
                              }}
                              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{law}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* City Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {availableCities.map(city => (
                          <label key={city} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={cityFilter.includes(city)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCityFilter([...cityFilter, city]);
                                } else {
                                  setCityFilter(cityFilter.filter(c => c !== city));
                                }
                              }}
                              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{city}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Province Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {availableProvinces.map(province => (
                          <label key={province} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={provinceFilter.includes(province)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProvinceFilter([...provinceFilter, province]);
                                } else {
                                  setProvinceFilter(provinceFilter.filter(p => p !== province));
                                }
                              }}
                              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{province}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Compliance Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Compliance</label>
                      <div className="space-y-2">
                        {availableCompliance.map(compliance => (
                          <label key={compliance} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={complianceFilter.includes(compliance)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setComplianceFilter([...complianceFilter, compliance]);
                                } else {
                                  setComplianceFilter(complianceFilter.filter(c => c !== compliance));
                                }
                              }}
                              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{compliance}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Export Buttons */}
            <AccomplishmentReportPDF
              title="Accomplishment Report"
              quarter={selectedQuarter}
              year={selectedYear}
              className="flex items-center gap-2"
              showExportOptions={true}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('inspections')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'inspections'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed Inspections
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Generated Reports
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'inspections' && (
          <>
            {user?.userlevel === 'Division Chief' ? (
              <DivisionChiefAccomplishmentReport />
            ) : (
              <CompletedInspectionsList
                inspections={paginatedData}
                loading={loading}
                onSummaryChange={handleSummaryChange}
              />
            )}
          </>
        )}

        {activeTab === 'reports' && (
          <ReportsList
            quarter={selectedQuarter}
            year={selectedYear}
          />
        )}


        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
            quarter={selectedQuarter}
            year={selectedYear}
            totalInspections={summaryStats.total}
          />
        )}
      </div>
    </LayoutWithSidebar>
    <Footer/>
    </>
  );
}
