import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import { getBillingRecords } from "../services/api";
import { 
  FileText, 
  Search, 
  Calendar, 
  Printer,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  ChevronDown,
  Loader2,
  Building,
  Eye
} from "lucide-react";
import PaginationControls, { useLocalStoragePagination } from "../components/PaginationControls";
import DateRangeDropdown from "../components/DateRangeDropdown";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Law options for tabs
const lawOptions = [
  { value: "RA-8749", label: "RA 8749", fullLabel: "Clean Air Act" },
  { value: "RA-9003", label: "RA 9003", fullLabel: "Ecological Solid Waste Management" },
  { value: "RA-9275", label: "RA 9275", fullLabel: "Clean Water Act" },
  { value: "RA-6969", label: "RA 6969", fullLabel: "Toxic Chemicals & Hazardous Wastes" },
  { value: "PD-1586", label: "PD 1586", fullLabel: "Environmental Impact Assessment" }
];

export default function Billing() {
  const navigate = useNavigate();
  const [billingRecords, setBillingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  
  // Tab-based filtering state
  const [selectedLaw, setSelectedLaw] = useState("RA-8749");
  const [showAllLaws, setShowAllLaws] = useState(false);
  const [tabCounts, setTabCounts] = useState({});

  // Pagination with localStorage
  const savedPagination = useLocalStoragePagination("billing_list");
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Advanced controls state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal state
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch billing records
      const params = {
        page: currentPage,
        page_size: pageSize,
        ...(debouncedSearchQuery && debouncedSearchQuery.length >= 2 && { search: debouncedSearchQuery }),
        ...(selectedLaw && !showAllLaws && { law: selectedLaw }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      };
      
      const recordsData = await getBillingRecords(params);
      
      setBillingRecords(recordsData.results || recordsData);
      setTotalCount(recordsData.count || (recordsData.results ? recordsData.results.length : recordsData.length));
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, selectedLaw, showAllLaws, dateFrom, dateTo]);

  // Fetch tab counts for display
  const fetchTabCounts = useCallback(async () => {
    try {
      const counts = {};
      for (const law of lawOptions) {
        const response = await getBillingRecords({ law: law.value, page_size: 1 });
        counts[law.value] = response.count || 0;
      }
      // Add "All Laws" count
      const allResponse = await getBillingRecords({ page_size: 1 });
      counts['all'] = allResponse.count || 0;
      setTabCounts(counts);
    } catch (error) {
      console.error("Error fetching tab counts:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, currentPage, debouncedSearchQuery, selectedLaw, showAllLaws, dateFrom, dateTo]);

  // Fetch tab counts on initial load
  useEffect(() => {
    fetchTabCounts();
  }, [fetchTabCounts]);

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get law display name
  const getLawDisplayName = (lawValue) => {
    const law = lawOptions.find(l => l.value === lawValue);
    return law ? law.fullLabel : lawValue;
  };

  // Get payment status
  const getPaymentStatus = (record) => {
    if (record.payment_status) {
      return record.payment_status.toLowerCase();
    }
    // Calculate status based on due date if payment_status not available
    if (!record.due_date) return 'pending';
    const dueDate = new Date(record.due_date);
    const today = new Date();
    if (today > dueDate) {
      return 'overdue';
    }
    return 'pending';
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue' },
      unpaid: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Unpaid' }
    };
    return badges[status] || badges.pending;
  };

  // Handle view details
  const handleViewDetails = (record) => {
    setSelectedBilling(record);
    setShowBillingModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowBillingModal(false);
    setSelectedBilling(null);
  };

  // Filter and sort billing records
  const filteredBillingRecords = useMemo(() => {
    let filtered = [...billingRecords];

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let compareA, compareB;
        
        switch (sortConfig.key) {
          case 'billing_code':
            compareA = a.billing_code || '';
            compareB = b.billing_code || '';
            break;
          case 'establishment_name':
            compareA = a.establishment_name || '';
            compareB = b.establishment_name || '';
            break;
          case 'amount':
            compareA = parseFloat(a.amount || 0);
            compareB = parseFloat(b.amount || 0);
            break;
          case 'due_date':
            compareA = new Date(a.due_date || '');
            compareB = new Date(b.due_date || '');
            break;
          case 'sent_date':
            compareA = new Date(a.sent_date || '');
            compareB = new Date(b.sent_date || '');
            break;
          default:
            return 0;
        }

        if (sortConfig.direction === 'asc') {
          return compareA > compareB ? 1 : -1;
        } else {
          return compareA < compareB ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [billingRecords, sortConfig]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Calculate active filter count
  const activeFilterCount = (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortDropdownOpen && !e.target.closest(".sort-dropdown")) {
        setSortDropdownOpen(false);
      }
      if (filtersOpen && !e.target.closest(".filter-dropdown")) {
        setFiltersOpen(false);
      }
    }

    if (sortDropdownOpen || filtersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortDropdownOpen, filtersOpen]);

  return (
    <>
      <Header />
      <LayoutWithSidebar>
        <div className="p-4 bg-white h-[calc(100vh-160px)]">
          {/* Top controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h1 className="text-2xl font-bold text-sky-600">Billing Records</h1>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search billing records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-0.5 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-lg min-w-xs hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute -translate-y-1/2 right-3 top-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <ArrowUpDown size={14} />
                  Sort by
                  <ChevronDown size={14} />
                </button>

                {sortDropdownOpen && (
                  <div className="absolute right-0 top-full z-20 w-48 mt-1 bg-white border border-gray-200 rounded shadow">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-sky-600 uppercase tracking-wide">
                        Sort Options
                      </div>
                      
                      {/* Sort Fields */}
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium text-sky-600 uppercase tracking-wide">
                          Sort by Field
                        </div>
                        {[
                          { key: 'billing_code', label: 'Billing Code' },
                          { key: 'establishment_name', label: 'Establishment' },
                          { key: 'amount', label: 'Amount' },
                          { key: 'due_date', label: 'Due Date' },
                          { key: 'sent_date', label: 'Sent Date' },
                        ].map((field) => (
                          <button
                            key={field.key}
                            onClick={() => handleSort(field.key)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                              sortConfig.key === field.key ? "bg-sky-50 font-medium" : ""
                            }`}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-medium">{field.label}</div>
                            </div>
                            {sortConfig.key === field.key && (
                              <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative filter-dropdown">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <Filter size={14} />
                  Filters
                  <ChevronDown size={14} />
                  {activeFilterCount > 0 && ` (${activeFilterCount})`}
                </button>

                {filtersOpen && (
                  <div className="absolute right-0 top-full z-20 w-56 mt-1 bg-white border border-gray-200 rounded shadow">
                    <div className="p-2">
                      <div className="flex items-center justify-between px-3 py-2 mb-2">
                        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                          Filter Options
                        </div>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={() => {
                              setDateFrom('');
                              setDateTo('');
                            }}
                            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range Dropdown */}
              <DateRangeDropdown
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onClear={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
              />
            </div>
          </div>

          {/* Law Tabs */}
          <div className="mb-4">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {/* All Laws Tab */}
                <button
                  onClick={() => {
                    setShowAllLaws(true);
                    setSelectedLaw("");
                    setCurrentPage(1);
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    showAllLaws
                      ? 'border-sky-500 text-sky-600 bg-sky-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All Laws{tabCounts['all'] > 0 ? ` (${tabCounts['all']})` : ''}
                </button>
                
                {/* Individual Law Tabs */}
                {lawOptions.map((law) => {
                  const count = tabCounts[law.value] || 0;
                  const displayLabel = count > 0 ? `${law.label} (${count})` : law.label;
                  return (
                    <button
                      key={law.value}
                      onClick={() => {
                        setSelectedLaw(law.value);
                        setShowAllLaws(false);
                        setCurrentPage(1);
                      }}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        selectedLaw === law.value && !showAllLaws
                          ? 'border-sky-500 text-sky-600 bg-sky-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {displayLabel}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Search results info */}
          <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
            <div>
              {!showAllLaws && selectedLaw ? (
                <span>
                  Showing billing records for <span className="font-medium text-sky-600">{lawOptions.find(l => l.value === selectedLaw)?.label}</span>
                  {debouncedSearchQuery && ` (filtered by search)`}
                </span>
              ) : (
                `Showing all billing records`
              )}
            </div>
            <div className="flex gap-2">
              {!showAllLaws && selectedLaw && (
                <button
                  onClick={() => setShowAllLaws(true)}
                  className="underline text-sky-600 hover:text-sky-700"
                >
                  Show All Laws
                </button>
              )}
            </div>
          </div>



          {/* Billing Records Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto h-[calc(100vh-280px)]">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-left text-white bg-gradient-to-r from-sky-600 to-sky-700 sticky top-0 z-10">
                    <th className="p-1 border-b border-gray-300">
                      <button
                        onClick={() => handleSort('billing_code')}
                        className="flex items-center gap-1 hover:text-gray-200"
                      >
                        Billing Code
                        {sortConfig.key === 'billing_code' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                      </button>
                    </th>
                    <th className="p-1 border-b border-gray-300">
                      <button
                        onClick={() => handleSort('establishment_name')}
                        className="flex items-center gap-1 hover:text-gray-200"
                      >
                        Establishment
                        {sortConfig.key === 'establishment_name' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                      </button>
                    </th>
                    {showAllLaws && (
                      <th className="p-1 border-b border-gray-300">Law</th>
                    )}
                    <th className="p-1 border-b border-gray-300">
                      <button
                        onClick={() => handleSort('amount')}
                        className="flex items-center gap-1 hover:text-gray-200"
                      >
                        Amount
                        {sortConfig.key === 'amount' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                      </button>
                    </th>
                    <th className="p-1 border-b border-gray-300">
                      <button
                        onClick={() => handleSort('due_date')}
                        className="flex items-center gap-1 hover:text-gray-200"
                      >
                        Due Date
                        {sortConfig.key === 'due_date' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                      </button>
                    </th>
                    <th className="p-1 border-b border-gray-300">
                      <button
                        onClick={() => handleSort('sent_date')}
                        className="flex items-center gap-1 hover:text-gray-200"
                      >
                        Issued Date
                        {sortConfig.key === 'sent_date' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                      </button>
                    </th>
                    <th className="p-1 border-b border-gray-300 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={showAllLaws ? "7" : "6"} className="px-2 py-12 text-center text-gray-500 border-b border-gray-300">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="text-sm">Loading billing records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBillingRecords.length === 0 ? (
                    <tr>
                      <td colSpan={showAllLaws ? "7" : "6"} className="px-2 py-12 text-center text-gray-500 border-b border-gray-300">
                        <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No billing records found</p>
                        <p className="text-sm text-gray-400 mt-1">Billing records will appear here when penalties are issued</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBillingRecords.map((record) => (
                      <tr key={record.id} className="p-1 text-xs border-b border-gray-300 hover:bg-gray-50">
                        <td className="p-1 font-semibold border-b border-gray-300">
                          <div className="flex items-center">
                            <FileText size={14} className="text-gray-400 mr-2" />
                            <span className="font-medium text-sky-600">
                              {record.billing_code}
                            </span>
                          </div>
                        </td>
                        <td className="p-1 border-b border-gray-300">
                          <div className="font-medium text-gray-900">
                            {record.establishment_name}
                          </div>
                          {record.contact_person && (
                            <div className="text-xs text-gray-500">
                              {record.contact_person}
                            </div>
                          )}
                        </td>
                        {showAllLaws && (
                          <td className="p-1 border-b border-gray-300">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{record.related_law}</span>
                              <span className="text-xs text-gray-500">{getLawDisplayName(record.related_law)}</span>
                            </div>
                          </td>
                        )}
                        <td className="p-1 border-b border-gray-300">
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(record.amount)}
                          </span>
                        </td>
                        <td className="p-1 border-b border-gray-300">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(record.due_date)}
                          </div>
                        </td>
                        <td className="p-1 border-b border-gray-300 text-sm text-gray-500">
                          {formatDate(record.sent_date)}
                        </td>
                        <td className="p-1 border-b border-gray-300 text-center">
                          <button
                            onClick={() => handleViewDetails(record)}
                            className="px-3 py-1 text-xs font-medium text-white bg-sky-600 rounded hover:bg-sky-700 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="p-4 border-t border-gray-200">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalCount / pageSize)}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  totalItems={totalCount}
                  showingStart={(currentPage - 1) * pageSize + 1}
                  showingEnd={Math.min(currentPage * pageSize, totalCount)}
                />
              </div>
            )}
          </div>
        </div>
      </LayoutWithSidebar>
      <Footer />

      {/* Billing Details Modal */}
      {showBillingModal && selectedBilling && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-sky-600 to-sky-700 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                <h2 className="text-xl font-bold">Billing Details</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:bg-sky-800 rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedBilling.billing_code}
                  </h3>
                  <p className="text-sm text-gray-500">Billing Code</p>
                </div>
                {(() => {
                  const status = getPaymentStatus(selectedBilling);
                  const badge = getStatusBadge(status);
                  return (
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Establishment Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-sky-600" />
                  Establishment Information
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Establishment Name</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedBilling.establishment_name}
                    </p>
                  </div>
                  {selectedBilling.contact_person && (
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Contact Person</p>
                      <p className="text-sm text-gray-900">
                        {selectedBilling.contact_person}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  Billing Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Related Law</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedBilling.related_law}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getLawDisplayName(selectedBilling.related_law)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Amount Due</p>
                    <p className="text-xl text-green-600 font-bold">
                      {formatCurrency(selectedBilling.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Due Date</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(selectedBilling.due_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Issued Date</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedBilling.sent_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/inspections/${selectedBilling.inspection}/review`)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded hover:bg-sky-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Related Inspection
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement print functionality
                    console.log('Print billing:', selectedBilling);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
