import { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import { getBillingRecords, markBillingAsPaid } from "../services/api";
import { 
  FileText, 
  Calendar, 
  ArrowUp,
  ArrowDown,
  Loader2,
  Building,
  Eye,
  X
} from "lucide-react";
import PaginationControls from "../components/PaginationControls";
import { useLocalStoragePagination } from "../hooks/useLocalStoragePagination";
import TableToolbar from "../components/common/TableToolbar";

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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Sort fields for TableToolbar
  const sortFields = [
    { key: 'billing_code', label: 'Billing Code' },
    { key: 'establishment_name', label: 'Establishment' },
    { key: 'amount', label: 'Amount' },
    { key: 'sent_date', label: 'Sent Date' },
  ];

  // Modal state
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [billingToMarkPaid, setBillingToMarkPaid] = useState(null);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [markPaidForm, setMarkPaidForm] = useState({
    paymentDate: "",
    paymentReference: "",
    paymentNotes: ""
  });
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  useEffect(() => {
    if (!feedbackMessage) return;
    const timeout = setTimeout(() => setFeedbackMessage(null), 5000);
    return () => clearTimeout(timeout);
  }, [feedbackMessage]);

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
    const status = record.payment_status?.toLowerCase() === 'paid' ? 'paid' : 'pending';
    const isOverdue =
      status === 'pending' &&
      record.due_date &&
      new Date(record.due_date) < new Date();

    return { status, isOverdue };
  };

  const getStatusLabel = ({ status, isOverdue }) => {
    if (status === 'paid') return 'Paid';
    if (isOverdue) return 'Overdue';
    return 'Pending';
  };

  // Get status badge styling
  const getStatusBadge = ({ status, isOverdue }) => {
    if (status === 'paid') {
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' };
    }

    if (isOverdue) {
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue' };
    }

    return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
  };

  // Handle view details
  const handleViewDetails = (record) => {
    setSelectedBilling(record);
    setShowBillingModal(true);
  };

  const openMarkPaidModal = (record) => {
    setBillingToMarkPaid(record);
    setMarkPaidForm({
      paymentDate: record.payment_date || new Date().toISOString().split('T')[0],
      paymentReference: record.payment_reference || "",
      paymentNotes: record.payment_notes || ""
    });
    setShowMarkPaidModal(true);
  };

  const closeMarkPaidModal = () => {
    setShowMarkPaidModal(false);
    setBillingToMarkPaid(null);
    setMarkPaidForm({
      paymentDate: "",
      paymentReference: "",
      paymentNotes: ""
    });
  };

  const handleMarkPaidSubmit = async (event) => {
    event.preventDefault();
    if (!billingToMarkPaid) return;

    try {
      setMarkPaidLoading(true);
      const payload = {
        payment_date: markPaidForm.paymentDate || undefined,
        payment_reference: markPaidForm.paymentReference || undefined,
        payment_notes: markPaidForm.paymentNotes || undefined,
      };

      const updatedRecord = await markBillingAsPaid(billingToMarkPaid.id, payload);

      setBillingRecords((prev) =>
        prev.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
      );
      if (selectedBilling?.id === updatedRecord.id) {
        setSelectedBilling(updatedRecord);
      }

      setFeedbackMessage({ type: "success", text: "Billing tagged as paid successfully." });
      closeMarkPaidModal();
    } catch (error) {
      console.error("Error marking billing as paid:", error);
      setFeedbackMessage({
        type: "error",
        text: error.message || "Failed to update billing status. Please try again.",
      });
    } finally {
      setMarkPaidLoading(false);
    }
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
  const handleSort = (fieldKey, directionKey = null) => {
    if (fieldKey === null) {
      setSortConfig({ key: null, direction: null });
    } else {
      setSortConfig({ key: fieldKey, direction: directionKey || "asc" });
    }
  };


  return (
    <>
      <Header />
      <LayoutWithSidebar>
        <div className="p-4 bg-white h-[calc(100vh-160px)]">
          {/* Top controls */}
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-sky-600 mb-3">Billing Records</h1>
            
            <TableToolbar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchClear={() => setSearchQuery('')}
              searchPlaceholder="Search billing records..."
              sortConfig={sortConfig}
              sortFields={sortFields}
              onSort={handleSort}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              exportConfig={{
                title: "Billing Records Export Report",
                fileName: "billing_records_export",
                columns: showAllLaws 
                  ? ["Billing Code", "Establishment", "Law", "Issued Date", "Payment Status"]
                  : ["Billing Code", "Establishment", "Issued Date", "Payment Status"],
                rows: filteredBillingRecords.map(record => {
                  const statusInfo = getPaymentStatus(record);
                  const statusLabel = getStatusLabel(statusInfo);
                  if (showAllLaws) {
                    return [
                      record.billing_code,
                      record.establishment_name,
                      record.related_law,
                      formatDate(record.sent_date),
                      statusLabel
                    ];
                  }
                  return [
                    record.billing_code,
                    record.establishment_name,
                    formatDate(record.sent_date),
                    statusLabel
                  ];
                })
              }}
              printConfig={{
                title: "Billing Records Print Report",
                fileName: "billing_records_print",
                columns: showAllLaws 
                  ? ["Billing Code", "Establishment", "Law", "Issued Date", "Payment Status"]
                  : ["Billing Code", "Establishment", "Issued Date", "Payment Status"],
                rows: filteredBillingRecords.map(record => {
                  const statusInfo = getPaymentStatus(record);
                  const statusLabel = getStatusLabel(statusInfo);
                  if (showAllLaws) {
                    return [
                      record.billing_code,
                      record.establishment_name,
                      record.related_law,
                      formatDate(record.sent_date),
                      statusLabel
                    ];
                  }
                  return [
                    record.billing_code,
                    record.establishment_name,
                    formatDate(record.sent_date),
                    statusLabel
                  ];
                }),
                selectedCount: filteredBillingRecords.length
              }}
              onRefresh={() => {
                setDateFrom('');
                setDateTo('');
                fetchData();
              }}
              isRefreshing={loading}
            />
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
        {feedbackMessage && (
          <div
            className={`mb-3 rounded border px-3 py-2 text-sm ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {feedbackMessage.text}
          </div>
        )}

        {/* Billing Records Table */}
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto h-[calc(100vh-350px)]">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-left text-white bg-gradient-to-r from-sky-600 to-sky-700 sticky top-0 z-10">
                    <th className="px-3 py-2 border-b border-gray-300">
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
                    <th className="px-3 py-2 border-b border-gray-300">
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
<th className="px-3 py-2 border-b border-gray-300">Law</th>
                    )}
                    <th className="px-3 py-2 border-b border-gray-300">
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
                    <th className="px-3 py-2 border-b border-gray-300">
                      Payment Status
                    </th>
                    <th className="px-3 py-2 border-b border-gray-300 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={showAllLaws ? "6" : "5"} className="px-2 py-12 text-center text-gray-500 border-b border-gray-300">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="text-sm">Loading billing records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBillingRecords.length === 0 ? (
                    <tr>
                      <td colSpan={showAllLaws ? "6" : "5"} className="px-2 py-12 text-center text-gray-500 border-b border-gray-300">
                        <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No billing records found</p>
                        <p className="text-sm text-gray-400 mt-1">Billing records will appear here when penalties are issued</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBillingRecords.map((record) => (
                      <tr key={record.id} className="text-xs border-b border-gray-300 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 font-semibold border-b border-gray-300">
                          <div className="flex items-center">
                            <FileText size={14} className="text-gray-400 mr-2" />
                            <span className="font-medium text-sky-600">
                              {record.billing_code}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 border-b border-gray-300">
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
                          <td className="px-3 py-2 border-b border-gray-300">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{record.related_law}</span>
                              <span className="text-xs text-gray-500">{getLawDisplayName(record.related_law)}</span>
                            </div>
                          </td>
                        )}
                      <td className="px-3 py-2 border-b border-gray-300 text-sm text-gray-500">
                        {formatDate(record.sent_date)}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-300">
                        {(() => {
                          const paymentInfo = getPaymentStatus(record);
                          const badge = getStatusBadge(paymentInfo);
                          return (
                            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                        <td className="px-3 py-2 border-b border-gray-300">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(record)}
                              className="px-3 py-1 text-xs font-medium text-white bg-sky-600 rounded hover:bg-sky-700 transition-colors"
                            >
                              View Details
                            </button>
                            {(record.payment_status || '').toUpperCase() !== 'PAID' && (
                              <button
                                onClick={() => openMarkPaidModal(record)}
                                className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors"
                              >
                                Mark as Paid
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
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
          className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4"
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
                  const paymentInfo = getPaymentStatus(selectedBilling);
                  const badge = getStatusBadge(paymentInfo);
                  return (
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {paymentInfo.status === 'pending' && paymentInfo.isOverdue && (
                        <span className="text-xs text-red-600">Overdue since {formatDate(selectedBilling.due_date)}</span>
                      )}
                      {paymentInfo.status === 'paid' && selectedBilling.payment_date && (
                        <span className="text-xs text-gray-500">
                          Paid on {formatDate(selectedBilling.payment_date)}
                        </span>
                      )}
                    </div>
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

              {(selectedBilling.payment_status?.toUpperCase() === 'PAID' ||
                selectedBilling.payment_reference ||
                selectedBilling.payment_notes) && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Payment Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedBilling.payment_date && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Payment Date</p>
                        <p className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(selectedBilling.payment_date)}
                        </p>
                      </div>
                    )}
                    {selectedBilling.payment_reference && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Reference / OR No.</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {selectedBilling.payment_reference}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedBilling.payment_notes && (
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Notes</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedBilling.payment_notes}
                      </p>
                    </div>
                  )}
                  {selectedBilling.payment_confirmed_by_name && (
                    <div className="text-xs text-gray-500">
                      Confirmed by {selectedBilling.payment_confirmed_by_name} on{" "}
                      {selectedBilling.payment_confirmed_at
                        ? new Date(selectedBilling.payment_confirmed_at).toLocaleString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </div>
                  )}
                </div>
              )}

              {(selectedBilling.payment_status || '').toUpperCase() !== 'PAID' && (
                <div className="flex justify-end">
                  <button
                    onClick={() => openMarkPaidModal(selectedBilling)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors"
                  >
                    Mark as Paid
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showMarkPaidModal && billingToMarkPaid && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4"
          onClick={closeMarkPaidModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-emerald-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Mark Billing as Paid</h3>
              </div>
              <button
                onClick={closeMarkPaidModal}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkPaidSubmit} className="p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {billingToMarkPaid.billing_code}
                </p>
                <p className="text-xs text-gray-500">
                  {billingToMarkPaid.establishment_name}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={markPaidForm.paymentDate}
                    onChange={(e) =>
                      setMarkPaidForm((prev) => ({ ...prev, paymentDate: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reference / OR Number
                  </label>
                  <input
                    type="text"
                    value={markPaidForm.paymentReference}
                    onChange={(e) =>
                      setMarkPaidForm((prev) => ({ ...prev, paymentReference: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Enter reference number (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={markPaidForm.paymentNotes}
                  onChange={(e) =>
                    setMarkPaidForm((prev) => ({ ...prev, paymentNotes: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
                  placeholder="Add any internal notes about this payment (optional)"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeMarkPaidModal}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  disabled={markPaidLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors disabled:opacity-60"
                  disabled={markPaidLoading}
                >
                  {markPaidLoading ? "Saving..." : "Confirm Paid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
