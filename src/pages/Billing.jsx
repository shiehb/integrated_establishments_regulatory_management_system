import { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import { getBillingRecords, markBillingAsPaid, markBillingAsUnpaid } from "../services/api";
import { 
  FileText, 
  Calendar, 
  ArrowUp,
  ArrowDown,
  Loader2,
  Building,
  Eye,
  X,
  Clock
} from "lucide-react";
import PaginationControls from "../components/PaginationControls";
import { useLocalStoragePagination } from "../hooks/useLocalStoragePagination";
import TableToolbar from "../components/common/TableToolbar";
import ConfirmationDialog from "../components/common/ConfirmationDialog";

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
  { value: "PD-1586", label: "PD 1586", fullLabel: "Environmental Impact Assessment" },
  { value: "RA-8749", label: "RA 8749", fullLabel: "Clean Air Act" },
  { value: "RA-9275", label: "RA 9275", fullLabel: "Clean Water Act" },
  { value: "RA-6969", label: "RA 6969", fullLabel: "Toxic Chemicals & Hazardous Wastes" },
  { value: "RA-9003", label: "RA 9003", fullLabel: "Ecological Solid Waste Management" },
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
  const [showMarkUnpaidModal, setShowMarkUnpaidModal] = useState(false);
  const [billingToMarkPaid, setBillingToMarkPaid] = useState(null);
  const [billingToMarkUnpaid, setBillingToMarkUnpaid] = useState(null);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [markUnpaidLoading, setMarkUnpaidLoading] = useState(false);
  const [markPaidForm, setMarkPaidForm] = useState({
    paymentDate: "",
    paymentReference: "",
    paymentNotes: ""
  });
  const [markUnpaidForm, setMarkUnpaidForm] = useState({
    paymentNotes: ""
  });
  const [markPaidConfirmation, setMarkPaidConfirmation] = useState({
    open: false,
    record: null,
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

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Get law display name
  const getLawDisplayName = (lawValue) => {
    const law = lawOptions.find(l => l.value === lawValue);
    return law ? law.fullLabel : lawValue;
  };

  // Get payment status
  const getPaymentStatus = (record) => {
    const status = record.payment_status?.toLowerCase() === 'paid' ? 'paid' : 'unpaid';
    const isOverdue =
      status === 'unpaid' &&
      record.due_date &&
      new Date(record.due_date) < new Date();

    return { status, isOverdue };
  };

  const getStatusLabel = ({ status, isOverdue }) => {
    if (status === 'paid') return 'Paid';
    if (isOverdue) return 'Overdue';
    return 'Unpaid';
  };

  // Get status badge styling
  const getStatusBadge = ({ status, isOverdue }) => {
    if (status === 'paid') {
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' };
    }

    if (isOverdue) {
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue' };
    }

    return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Unpaid' };
  };

  const getLastUpdatedBy = (billing) => {
    if (!billing) return 'System';
    if (billing.payment_confirmed_by_name) return billing.payment_confirmed_by_name;
    if (billing.issued_by_name) return billing.issued_by_name;
    return 'System';
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

  const requestMarkPaidConfirmation = (record) => {
    if (!record) return;
    setMarkPaidConfirmation({ open: true, record });
  };

  const handleConfirmMarkPaid = () => {
    if (!markPaidConfirmation.record) {
      setMarkPaidConfirmation({ open: false, record: null });
      return;
    }
    openMarkPaidModal(markPaidConfirmation.record);
    setMarkPaidConfirmation({ open: false, record: null });
  };

  const handleCancelMarkPaid = () => {
    setMarkPaidConfirmation({ open: false, record: null });
  };

  const addMistakenPaymentRemark = () => {
    const timestamp = new Date().toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    const template = `Mistaken payment recorded on ${timestamp}. Details: `;

    setMarkPaidForm((prev) => {
      const existing = prev.paymentNotes || "";
      if (existing.includes(template)) {
        return prev;
      }
      const separator = existing.trim() ? "\n" : "";
      return {
        ...prev,
        paymentNotes: `${existing}${separator}${template}`
      };
    });
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

  const openMarkUnpaidModal = (record) => {
    const timestamp = new Date().toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    const defaultNote = `Marked as unpaid on ${timestamp}. Reason: `;
    setBillingToMarkUnpaid(record);
    setMarkUnpaidForm({
      paymentNotes: record?.payment_notes?.includes('Marked as unpaid')
        ? record.payment_notes
        : `${defaultNote}`
    });
    setShowMarkUnpaidModal(true);
  };

  const closeMarkUnpaidModal = () => {
    setShowMarkUnpaidModal(false);
    setBillingToMarkUnpaid(null);
    setMarkUnpaidForm({ paymentNotes: "" });
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

  const handleMarkUnpaidSubmit = async (event) => {
    event.preventDefault();
    if (!billingToMarkUnpaid) return;

    if (!markUnpaidForm.paymentNotes.trim()) {
      setFeedbackMessage({
        type: "error",
        text: "Please provide a remark explaining why the billing is being marked as unpaid."
      });
      return;
    }

    try {
      setMarkUnpaidLoading(true);
      const payload = {
        payment_notes: markUnpaidForm.paymentNotes
      };
      const updatedRecord = await markBillingAsUnpaid(billingToMarkUnpaid.id, payload);

      setBillingRecords((prev) =>
        prev.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
      );
      if (selectedBilling?.id === updatedRecord.id) {
        setSelectedBilling(updatedRecord);
      }

      setFeedbackMessage({ type: "success", text: "Billing reverted to unpaid status." });
      closeMarkUnpaidModal();
    } catch (error) {
      console.error("Error marking billing as unpaid:", error);
      setFeedbackMessage({
        type: "error",
        text: error.message || "Failed to revert billing status. Please try again.",
      });
    } finally {
      setMarkUnpaidLoading(false);
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
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h1 className="text-2xl font-bold text-sky-600">Billing Records</h1>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
            <div className="overflow-x-auto h-[calc(100vh-312px)]">
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
                                onClick={() => requestMarkPaidConfirmation(record)}
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
            
          </div>
          {/* Pagination */}
          {totalCount > 0 && (
              <div className="mt-2">
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
      </LayoutWithSidebar>
      <Footer />

      {/* Billing Details Modal */}
      {showBillingModal && selectedBilling && (
        <div 
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white border border-gray-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-300 p-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Billing Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-2">
              {/* Header Section */}
              <div className="border-b border-gray-300 ">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {selectedBilling.billing_code}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">Billing Code</p>
                  </div>
                  {(() => {
                    const paymentInfo = getPaymentStatus(selectedBilling);
                    const badge = getStatusBadge(paymentInfo);
                    return (
                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs font-medium border ${badge.bg} ${badge.text} border-gray-400`}>
                          {badge.label}
                        </span>
                        {paymentInfo.status === 'unpaid' && paymentInfo.isOverdue && (
                          <p className="text-xs text-gray-600 mt-1">Overdue since {formatDate(selectedBilling.due_date)}</p>
                        )}
                        {paymentInfo.status === 'paid' && selectedBilling.payment_date && (
                          <p className="text-xs text-gray-600 mt-1">Paid on {formatDate(selectedBilling.payment_date)}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Billing Information */}
              <div className="border-b border-gray-300 pb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Billing Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Amount Due</p>
                    <p className="text-base text-gray-900 font-semibold">
                      {formatCurrency(selectedBilling.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Related Law</p>
                    <p className="text-sm text-gray-900">
                      {selectedBilling.related_law}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {getLawDisplayName(selectedBilling.related_law)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Issued Date</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedBilling.sent_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Due Date</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedBilling.due_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Establishment Information */}
              <div className="border-b border-gray-300 pb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Establishment Information</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Establishment Name</p>
                    <p className="text-sm text-gray-900">
                      {selectedBilling.establishment_name}
                    </p>
                  </div>
                  {selectedBilling.contact_person && (
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Contact Person</p>
                      <p className="text-sm text-gray-900">
                        {selectedBilling.contact_person}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {(selectedBilling.payment_status?.toUpperCase() === 'PAID' ||
                selectedBilling.payment_reference ||
                selectedBilling.payment_notes) && (
                <div className="border-b border-gray-300 pb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBilling.payment_date && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Payment Date</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedBilling.payment_date)}
                        </p>
                      </div>
                    )}
                    {selectedBilling.payment_reference && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Reference / OR No.</p>
                        <p className="text-sm text-gray-900">
                          {selectedBilling.payment_reference}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedBilling.payment_notes && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 font-medium mb-1">Notes</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap border border-gray-300 p-3 bg-gray-50">
                        {selectedBilling.payment_notes}
                      </p>
                    </div>
                  )}
                  {selectedBilling.payment_confirmed_by_name && (
                    <div className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                {(selectedBilling.payment_status || '').toUpperCase() !== 'PAID' && (
                  <button
                    onClick={() => requestMarkPaidConfirmation(selectedBilling)}
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded"
                  >
                    Mark as Paid
                  </button>
                )}
                {(selectedBilling.payment_status || '').toUpperCase() === 'PAID' && (
                  <button
                    onClick={() => openMarkUnpaidModal(selectedBilling)}
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded"
                  >
                    Mark as Unpaid
                  </button>
                )}
              </div>

              {/* Last Updated Info */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                <p>Last updated: {formatDateTime(selectedBilling.updated_at)} by {getLastUpdatedBy(selectedBilling)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showMarkPaidModal && billingToMarkPaid && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={closeMarkPaidModal}
        >
          <div
            className="bg-white border border-gray-300 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border-b border-gray-300 px-6 py-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Mark Billing as Paid</h3>
              <button
                onClick={closeMarkPaidModal}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkPaidSubmit} className="p-6 space-y-4">
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm font-semibold text-gray-900">
                  {billingToMarkPaid.billing_code}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {billingToMarkPaid.establishment_name}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Payment Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={markPaidForm.paymentDate}
                    onChange={(e) =>
                      setMarkPaidForm((prev) => ({ ...prev, paymentDate: e.target.value }))
                    }
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reference / OR Number
                  </label>
                  <input
                    type="text"
                    value={markPaidForm.paymentReference}
                    onChange={(e) =>
                      setMarkPaidForm((prev) => ({ ...prev, paymentReference: e.target.value }))
                    }
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                    placeholder="Enter reference number (optional)"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Notes / Remarks
                  </label>
                </div>
                <textarea
                  value={markPaidForm.paymentNotes}
                  onChange={(e) =>
                    setMarkPaidForm((prev) => ({ ...prev, paymentNotes: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-500 min-h-[100px]"
                  placeholder="Enter payment details or notes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
                <button
                  type="button"
                  onClick={closeMarkPaidModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded"
                  disabled={markPaidLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded"
                  disabled={markPaidLoading}
                >
                  {markPaidLoading ? "Saving..." : "Confirm Paid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark as Unpaid Modal */}
      {showMarkUnpaidModal && billingToMarkUnpaid && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={closeMarkUnpaidModal}
        >
          <div
            className="bg-white border border-gray-300 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border-b border-gray-300 px-6 py-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Revert to Unpaid</h3>
              <button
                onClick={closeMarkUnpaidModal}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkUnpaidSubmit} className="p-6 space-y-4">
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm font-semibold text-gray-900">
                  {billingToMarkUnpaid.billing_code}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {billingToMarkUnpaid.establishment_name}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  This will change the payment status back to unpaid and clear payment dates and references.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Remark <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  value={markUnpaidForm.paymentNotes}
                  onChange={(e) =>
                    setMarkUnpaidForm((prev) => ({ ...prev, paymentNotes: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-500 min-h-[100px]"
                  placeholder="Explain why this billing is being reverted to unpaid."
                />
                <p className="mt-1 text-xs text-gray-600">
                  Notes are visible in Billing Details to provide audit history.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
                <button
                  type="button"
                  onClick={closeMarkUnpaidModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded"
                  disabled={markUnpaidLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded"
                  disabled={markUnpaidLoading}
                >
                  {markUnpaidLoading ? "Saving..." : "Confirm Unpaid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmationDialog
        open={markPaidConfirmation.open}
        title="Confirm Mark as Paid"
        message={() => (
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              Billing Code:{" "}
              <span className="font-semibold text-gray-900">
                {markPaidConfirmation.record?.billing_code}
              </span>
            </p>
            <p>
              Establishment:{" "}
              <span className="font-semibold text-gray-900">
                {markPaidConfirmation.record?.establishment_name}
              </span>
            </p>
            <p>
              Amount:{" "}
              <span className="font-semibold text-gray-900">
                {formatCurrency(markPaidConfirmation.record?.amount)}
              </span>
            </p>
            <p className="text-red-600 font-medium pt-2">
              Proceed only if you have verified that official payment was received.
            </p>
          </div>
        )}
        confirmText="Yes, mark as paid"
        confirmColor="green"
        onCancel={handleCancelMarkPaid}
        onConfirm={handleConfirmMarkPaid}
      />
    </>
  );
}
