import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import { getBillingRecords, getBillingStatistics } from "../services/api";
import { 
  FileText, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Printer,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  ChevronDown,
  Loader2
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

export default function Billing() {
  const navigate = useNavigate();
  const [billingRecords, setBillingRecords] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLaw, setFilterLaw] = useState("");
  const [totalCount, setTotalCount] = useState(0);

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

  useEffect(() => {
    fetchData();
  }, [currentPage, debouncedSearchQuery, filterLaw, dateFrom, dateTo]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch billing records
      const params = {
        page: currentPage,
        page_size: pageSize,
        ...(debouncedSearchQuery && debouncedSearchQuery.length >= 2 && { search: debouncedSearchQuery }),
        ...(filterLaw && { law: filterLaw }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      };
      
      const recordsData = await getBillingRecords(params);
      setBillingRecords(recordsData.results || recordsData);
      setTotalCount(recordsData.count || (recordsData.results ? recordsData.results.length : recordsData.length));
      
      // Fetch statistics
      const stats = await getBillingStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, filterLaw, dateFrom, dateTo]);

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
  const activeFilterCount = (filterLaw ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

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
        <div className="p-4 bg-gray-50">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-2 text-sky-600" />
              Billing Records
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage penalty billing records from non-compliant inspections
            </p>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.total_records}
                    </p>
                  </div>
                  <FileText className="w-10 h-10 text-sky-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(statistics.total_amount)}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Amount</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {formatCurrency(statistics.average_amount)}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-amber-600" />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
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
                              setFilterLaw('');
                              setDateFrom('');
                              setDateTo('');
                            }}
                            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      {/* Law Filter */}
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Related Law
                        </div>
                        <select
                          value={filterLaw}
                          onChange={(e) => setFilterLaw(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="">All Laws</option>
                          <option value="RA8749">RA 8749 (Clean Air Act)</option>
                          <option value="RA9003">RA 9003 (Solid Waste Management)</option>
                          <option value="RA9275">RA 9275 (Clean Water Act)</option>
                        </select>
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

          {/* Billing Records Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
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
                    <th className="p-1 border-b border-gray-300">Law</th>
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
                      <td colSpan="7" className="px-2 py-12 text-center text-gray-500 border-b border-gray-300">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="text-sm">Loading billing records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBillingRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-2 py-12 text-center text-gray-500 border-b border-gray-300">
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
                        <td className="p-1 border-b border-gray-300">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold border rounded bg-blue-100 text-blue-800 border-blue-300">
                            {record.related_law}
                          </span>
                        </td>
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
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/inspections/${record.inspection}/review`)}
                              className="text-sky-600 hover:text-sky-800 font-medium text-xs"
                            >
                              View Inspection
                            </button>
                            <button
                              onClick={() => {/* TODO: Print receipt */}}
                              className="text-gray-600 hover:text-gray-800"
                              title="Print Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
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
    </>
  );
}
