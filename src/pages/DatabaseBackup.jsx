// src/pages/DatabaseBackup.jsx
import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import { useNotifications } from "../components/NotificationManager";
import ExportDropdown from "../components/ExportDropdown";
import PrintPDF from "../components/PrintPDF";
import DateRangeDropdown from "../components/DateRangeDropdown";
import PaginationControls, { useLocalStoragePagination } from "../components/PaginationControls";
import {
  Save,
  Upload,
  Database,
  Braces,
  Download,
  Trash2,
  RotateCcw,
  RefreshCw,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  getProfile,
  createBackup,
  restoreBackupFromFile,
  restoreBackupByName,
  getBackups,
  deleteBackup,
  downloadBackup,
} from "../services/api";

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

const DatabaseBackup = () => {
  const [userLevel, setUserLevel] = useState("public");
  const [loadingUser, setLoadingUser] = useState(true);

  const [backupFormat, setBackupFormat] = useState("json");
  const [backupPath, setBackupPath] = useState("");
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreFileName, setRestoreFileName] = useState("");

  const [processing, setProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(""); // "backup", "restore", "delete"
  const notifications = useNotifications();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupToDelete, setBackupToDelete] = useState(null);

  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(true);

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formatFilter, setFormatFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ✅ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // ✅ Pagination with localStorage
  const savedPagination = useLocalStoragePagination("backups_list");
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);

  // ✅ Bulk select
  const [selectedBackups, setSelectedBackups] = useState([]);

  // fetch user level
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getProfile();
        setUserLevel(profile.userlevel || "public");
      } catch (err) {
        console.error("Error fetching profile:", err);
        showMessage("Failed to load user profile", "error");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserProfile();
  }, []);

  // load backups list
  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      const data = await getBackups();
      setBackups(data.backups || []);
    } catch (error) {
      console.error("Error loading backups:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to load backups";
      showMessage(errorMessage, "error");
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const showMessage = (msg, type = "success") => {
    if (type === "success") {
      notifications.success(msg, {
        title: "Backup Operation",
        duration: 4000
      });
    } else if (type === "error") {
      notifications.error(msg, {
        title: "Backup Error",
        duration: 6000
      });
    } else {
      notifications.info(msg, {
        title: "Backup Info",
        duration: 4000
      });
    }
  };

  const handleBackup = async () => {
    try {
      setProcessing(true);
      setProcessingAction("backup");
      const response = await createBackup(backupFormat, backupPath);
      showMessage(response.message || "Backup created successfully!");
      // Reset form
      setBackupPath("");
      loadBackups();
    } catch (error) {
      console.error("Backup error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create backup";
      showMessage(errorMessage, "error");
    } finally {
      setProcessing(false);
      setProcessingAction("");
      setConfirmOpen(false);
    }
  };

  const handleRestore = async () => {
    try {
      setProcessing(true);
      setProcessingAction("restore");
      let response;

      if (selectedBackup) {
        response = await restoreBackupByName(selectedBackup.fileName);
      } else if (restoreFile) {
        response = await restoreBackupFromFile(restoreFile);
      } else {
        showMessage("Please choose a backup file", "error");
        return;
      }

      showMessage(response.message || "Database restored successfully!");
      // Reset form
      setRestoreFile(null);
      setRestoreFileName("");
      setSelectedBackup(null);
      loadBackups();
    } catch (error) {
      console.error("Restore error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to restore backup";
      showMessage(errorMessage, "error");
    } finally {
      setProcessing(false);
      setProcessingAction("");
      setRestoreConfirm(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!backupToDelete) return;

    try {
      setProcessing(true);
      setProcessingAction("delete");
      await deleteBackup(backupToDelete.fileName);
      showMessage("Backup deleted successfully!");
      loadBackups();
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to delete backup";
      showMessage(errorMessage, "error");
    } finally {
      setProcessing(false);
      setProcessingAction("");
      setDeleteConfirm(false);
      setBackupToDelete(null);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith(".sql") || file.name.endsWith(".json")) {
        setRestoreFile(file);
        setRestoreFileName(file.name);
        setSelectedBackup(null);
      } else {
        showMessage("Please select a .sql or .json file", "error");
      }
    }
  };

  const handleBackupSelect = (backup) => {
    setSelectedBackup(backup);
    setRestoreFile(null);
    setRestoreFileName("");
  };

  // Add this useEffect to handle clicks outside the dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (filtersOpen && !e.target.closest(".filter-dropdown")) {
        setFiltersOpen(false);
      }
      if (sortDropdownOpen && !e.target.closest(".sort-dropdown")) {
        setSortDropdownOpen(false);
      }
    }

    if (filtersOpen || sortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtersOpen, sortDropdownOpen]);

  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  // Sort options for dropdown
  const sortFields = [
    { key: "fileName", label: "File Name" },
    { key: "format", label: "Format" },
    { key: "created", label: "Created Date" },
    { key: "size", label: "Size" },
  ];

  const sortDirections = [
    { key: "asc", label: "Ascending" },
    { key: "desc", label: "Descending" },
  ];

  // ✅ Filter + Sort with LOCAL search (client-side only)
  const filteredBackups = useMemo(() => {
    let list = backups.filter((backup) => {
      // Apply local search filter
      const query = debouncedSearchQuery.toLowerCase();
      const fileName = (backup.fileName || "").toLowerCase();
      const format = (backup.format || "").toLowerCase();

      const matchesSearch = debouncedSearchQuery
        ? fileName.includes(query) || format.includes(query)
        : true;

      // Apply format filter
      const matchesFormat =
        formatFilter.length === 0 || formatFilter.includes(backup.format);

      // Apply date filter
      const matchesDateFrom = dateFrom
        ? new Date(backup.created) >= new Date(dateFrom)
        : true;
      const matchesDateTo = dateTo
        ? new Date(backup.created) <= new Date(dateTo)
        : true;

      return matchesSearch && matchesFormat && matchesDateFrom && matchesDateTo;
    });

    // Apply sorting
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === "created") {
          aVal = new Date(a.created).getTime();
          bVal = new Date(b.created).getTime();
        } else if (sortConfig.key === "size") {
          // Extract numeric value from size string (e.g., "1.5 MB" -> 1.5)
          const extractSize = (sizeStr) => {
            const match = sizeStr.match(/(\d+\.?\d*)/);
            return match ? parseFloat(match[1]) : 0;
          };
          aVal = extractSize(a.size);
          bVal = extractSize(b.size);
        } else {
          aVal = a[sortConfig.key] || "";
          bVal = b[sortConfig.key] || "";
        }

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [backups, debouncedSearchQuery, formatFilter, dateFrom, dateTo, sortConfig]);

  // ✅ Pagination (client-side for now)
  const totalPages = Math.ceil(filteredBackups.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBackups = filteredBackups.slice(startIndex, endIndex);

  // ✅ Selection
  const toggleSelect = (fileName) => {
    setSelectedBackups((prev) =>
      prev.includes(fileName) ? prev.filter((x) => x !== fileName) : [...prev, fileName]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBackups.length === paginatedBackups.length) {
      setSelectedBackups([]);
    } else {
      setSelectedBackups(paginatedBackups.map((backup) => backup.fileName));
    }
  };

  // Toggle format filter checkboxes
  const toggleFormat = (format) =>
    setFormatFilter((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );

  // Clear functions
  const clearSearch = () => setSearchQuery("");
  const clearAllFilters = () => {
    setSearchQuery("");
    setFormatFilter([]);
    setDateFrom("");
    setDateTo("");
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  };

  const handleSortFromDropdown = (fieldKey, directionKey) => {
    if (fieldKey) {
      setSortConfig({ key: fieldKey, direction: directionKey || "asc" });
    } else {
      setSortConfig({ key: null, direction: null });
    }
  };

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const totalBackups = backups.length;
  const filteredCount = filteredBackups.length;
  const hasActiveFilters =
    searchQuery ||
    formatFilter.length > 0 ||
    dateFrom ||
    dateTo ||
    sortConfig.key;
  const activeFilterCount =
    formatFilter.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  // Calculate display range
  const startItem = startIndex + 1;
  const endItem = Math.min(endIndex, filteredCount);

  const handleDownloadBackup = async (backup) => {
    try {
      const response = await downloadBackup(backup.fileName);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", backup.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showMessage(`Downloading ${backup.fileName}`, "info");
    } catch (error) {
      console.error("Download error:", error);
      showMessage("Failed to download backup file", "error");
    }
  };

  const formatIcons = {
    json: Braces,
    sql: Database,
  };

  const getFormatDescription = (format) => {
    const descriptions = {
      json: "Django data format (recommended for MariaDB 10.4)",
      sql: "Database native format (requires MySQL tools for best performance)",
    };
    return descriptions[format] || "";
  };

  if (loadingUser) {
    return (
      <>
        <Header />
        <LayoutWithSidebar>
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 mb-2 border-b-2 rounded-full border-sky-600 animate-spin"></div>
            <p className="text-gray-600">Loading Backup Page...</p>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel={userLevel}>
        <div className="p-4 bg-white h-[calc(100vh-165px)] overflow-y-auto">
          <h1 className="flex items-center mb-4 text-2xl font-bold text-sky-600">
            {" "}
            Database Backup & Restore
          </h1>


          {/* Updated Layout: Backup/Restore side by side, Table at bottom */}
          <div className="flex flex-col gap-6">
            {/* Backup & Restore Section - Side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Backup Section - Left side */}
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow">
                <h2 className="mb-2 text-lg font-semibold text-sky-600">
                  Create Backup
                </h2>
                <div className="flex-1 space-y-6">
                  {/* Backup Format Selection */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Backup Format
                    </label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {["json", "sql"].map((format) => {
                        const Icon = formatIcons[format];
                        const isSelected = backupFormat === format;
                        return (
                          <div
                            key={format}
                            onClick={() => setBackupFormat(format)}
                            className={`cursor-pointer py-2 px-4 border-2 rounded-lg shadow transition flex flex-col items-center
                              ${
                                isSelected
                                  ? "border-sky-600 bg-sky-50 ring-2 ring-sky-500"
                                  : "border-gray-300 hover:border-sky-400 hover:bg-gray-50"
                              }`}
                          >
                            <Icon
                              className={`mb-2 ${
                                isSelected ? "text-sky-600" : "text-gray-400"
                              }`}
                              size={28}
                              strokeWidth={2}
                            />
                            <h3
                              className={`font-semibold capitalize ${
                                isSelected ? "text-sky-700" : "text-gray-800"
                              }`}
                            >
                              {format.toUpperCase()}
                            </h3>
                            <p className="mt-1 text-xs text-center text-gray-500">
                              {getFormatDescription(format)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Backup Path Input */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Custom Save Path (Optional)
                    </label>
                    <input
                      type="text"
                      value={backupPath}
                      onChange={(e) => setBackupPath(e.target.value)}
                      placeholder="C:/custom/path/backup/"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty to use default backup directory: backups/
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={processing}
                    className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing && processingAction === "backup" ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={18} />
                        Create Backup
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Restore Section - Right side */}
              <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-sky-600">
                  Restore Backup
                </h2>
                <div className="flex-1 space-y-6">
                  {/* Restore File Selection */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Select Backup File
                    </label>
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          if (
                            file.name.endsWith(".sql") ||
                            file.name.endsWith(".json")
                          ) {
                            setRestoreFile(file);
                            setRestoreFileName(file.name);
                            setSelectedBackup(null);
                          } else {
                            showMessage(
                              "Please drop a .sql or .json file",
                              "error"
                            );
                          }
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition 
                        ${
                          restoreFile || selectedBackup
                            ? "border-green-600 bg-green-50"
                            : "border-gray-300 hover:border-sky-500 hover:bg-sky-50"
                        }`}
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                    >
                      {restoreFile || selectedBackup ? (
                        <>
                          <p className="text-sm font-medium text-gray-800">
                            {restoreFileName || selectedBackup?.fileName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {selectedBackup
                              ? "Backup selected from list"
                              : "File ready to restore"}
                          </p>
                          <p className="mt-2 text-xs font-medium text-green-600">
                            ✓ Ready to restore
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="mb-2 text-gray-400" size={24} />
                          <p className="text-sm text-gray-600">
                            Drag & drop a backup file here
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            or click to browse (.sql or .json)
                          </p>
                        </>
                      )}
                      <input
                        id="fileInput"
                        type="file"
                        className="hidden"
                        accept=".sql,.json"
                        onChange={handleFileSelect}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Or select a backup from the table below
                    </p>
                  </div>

                  {/* Selected Backup Info */}
                  {selectedBackup && (
                    <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
                      <p className="text-sm font-medium text-blue-800">
                        Selected: {selectedBackup.fileName}
                      </p>
                      <p className="text-xs text-blue-600">
                        Created: {selectedBackup.created} • Size:{" "}
                        {selectedBackup.size}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setRestoreConfirm(true)}
                    disabled={processing || (!restoreFile && !selectedBackup)}
                    className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing && processingAction === "restore" ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Restoring...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2" size={18} />
                        Restore Backup
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section - Full width at bottom */}
            <div className="bg-white shadow-lg p-4">
              <div className="p-4 border-b border-gray-200 rounded-t-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-sky-600">
                    Available Backups
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* 🔍 Search Bar */}
                    <div className="relative">
                      <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="text"
                        placeholder="Search backups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-0.5 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-lg min-w-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                      {searchQuery && (
                        <button
                          onClick={clearSearch}
                          className="absolute -translate-y-1/2 right-3 top-1/2"
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>

                    {/* 🔽 Sort Dropdown */}
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
                        <div className="absolute right-0 z-20 w-48 mt-1 bg-white border border-gray-200 rounded shadow">
                          <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Sort Options
                            </div>
                            
                            {/* Sort by Field Section */}
                            <div className="mb-2">
                              <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Sort by Field
                              </div>
                              {sortFields.map((field) => (
                                <button
                                  key={field.key}
                                  onClick={() =>
                                    handleSortFromDropdown(
                                      field.key,
                                      sortConfig.key === field.key
                                        ? sortConfig.direction === "asc"
                                          ? "desc"
                                          : "asc"
                                        : "asc"
                                    )
                                  }
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

                            {/* Order Section - Shown if a field is selected */}
                            {sortConfig.key && (
                              <>
                                <div className="my-1 border-t border-gray-200"></div>
                                <div>
                                  <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    Sort Order
                                  </div>
                                  {sortDirections.map((dir) => (
                                    <button
                                      key={dir.key}
                                      onClick={() =>
                                        handleSortFromDropdown(sortConfig.key, dir.key)
                                      }
                                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                                        sortConfig.direction === dir.key ? "bg-sky-50 font-medium" : ""
                                      }`}
                                    >
                                      <div className="flex-1 text-left">
                                        <div className="font-medium">{dir.label}</div>
                                      </div>
                                      {sortConfig.direction === dir.key && (
                                        <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 🎚 Filters dropdown */}
                    <div className="relative filter-dropdown">
                      <button
                        onClick={() => setFiltersOpen((prev) => !prev)}
                        className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                      >
                        <Filter size={14} />
                        Filters
                        <ChevronDown size={14} />
                        {activeFilterCount > 0 && ` (${activeFilterCount})`}
                      </button>

                      {filtersOpen && (
                        <div className="absolute right-0 z-20 w-56 mt-1 bg-white border border-gray-200 rounded shadow">
                          <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2 mb-2">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Filter Options
                              </div>
                              {formatFilter.length > 0 && (
                                <button
                                  onClick={() => {
                                    setFormatFilter([]);
                                  }}
                                  className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                >
                                  Clear All
                                </button>
                              )}
                            </div>
                            
                            {/* Format Section */}
                            <div className="mb-3">
                              <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Backup Format
                              </div>
                              {["json", "sql"].map((format) => (
                                <button
                                  key={format}
                                  onClick={() => toggleFormat(format)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                                    formatFilter.includes(format) ? "bg-sky-50 font-medium" : ""
                                  }`}
                                >
                                  <div className="flex-1 text-left">
                                    <div className="font-medium">{format.toUpperCase()}</div>
                                  </div>
                                  {formatFilter.includes(format) && (
                                    <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <DateRangeDropdown
                      dateFrom={dateFrom}
                      dateTo={dateTo}
                      onDateFromChange={setDateFrom}
                      onDateToChange={setDateTo}
                      onClear={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className="flex items-center text-sm"
                    />

                    <ExportDropdown
                      title="Backups Export Report"
                      fileName="backups_export"
                      columns={["File Name", "Format", "Created Date", "Size"]}
                      rows={selectedBackups.length > 0 ? 
                        selectedBackups.map(fileName => {
                          const backup = backups.find(b => b.fileName === fileName);
                          return backup ? [
                            backup.fileName,
                            backup.format.toUpperCase(),
                            formatFullDate(backup.created),
                            backup.size
                          ] : [];
                        }).filter(row => row.length > 0) : 
                        backups.map(backup => [
                          backup.fileName,
                          backup.format.toUpperCase(),
                          formatFullDate(backup.created),
                          backup.size
                        ])
                      }
                      disabled={backups.length === 0}
                      className="flex items-center text-sm"
                    />

                    <PrintPDF
                      title="Backups Report"
                      fileName="backups_report"
                      columns={["File Name", "Format", "Created Date", "Size"]}
                      rows={selectedBackups.length > 0 ? 
                        selectedBackups.map(fileName => {
                          const backup = backups.find(b => b.fileName === fileName);
                          return backup ? [
                            backup.fileName,
                            backup.format.toUpperCase(),
                            formatFullDate(backup.created),
                            backup.size
                          ] : [];
                        }).filter(row => row.length > 0) : 
                        backups.map(backup => [
                          backup.fileName,
                          backup.format.toUpperCase(),
                          formatFullDate(backup.created),
                          backup.size
                        ])
                      }
                      selectedCount={selectedBackups.length}
                      disabled={backups.length === 0}
                      className="flex items-center px-3 py-1 text-sm"
                    />

                    <button
                      onClick={loadBackups}
                      disabled={loadingBackups}
                      className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`mr-1 ${
                          loadingBackups ? "animate-spin" : ""
                        }`}
                        size={14}
                      />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* 📊 Search results info */}
                {(hasActiveFilters || filteredCount !== totalBackups) && (
                  <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                    <div>
                      {filteredCount === totalBackups
                        ? `Showing all ${totalBackups} backup(s)`
                        : `Showing ${filteredCount} of ${totalBackups} backup(s)`}
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="underline text-sky-600 hover:text-sky-700"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="text-sm text-left text-white bg-sky-700">
                      <th className="w-6 p-1 text-center border-b border-gray-300">
                        <input
                          type="checkbox"
                          checked={
                            selectedBackups.length > 0 &&
                            selectedBackups.length === paginatedBackups.length
                          }
                          onChange={toggleSelectAll}
                        />
                      </th>
                      {[
                        { key: "fileName", label: "File Name", sortable: true },
                        { key: "format", label: "Format", sortable: true },
                        { key: "created", label: "Created Date", sortable: true },
                        { key: "size", label: "Size", sortable: true },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className={`p-1 border-b border-gray-300 ${
                            col.sortable ? "cursor-pointer" : ""
                          }`}
                          onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        >
                          <div className="flex items-center gap-1">
                            {col.label} {col.sortable && getSortIcon(col.key)}
                          </div>
                        </th>
                      ))}
                      <th className="p-1 text-center border-b border-gray-300 w-35">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBackups ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-2 py-8 text-center border border-gray-300"
                        >
                          <div className="flex flex-col items-center justify-center p-4">
                            <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-600">Loading backups...</p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedBackups.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-2 py-4 text-center text-gray-500 border border-gray-300"
                        >
                          {hasActiveFilters ? (
                            <div>
                              No backups found matching your criteria.
                              <br />
                              <button
                                onClick={clearAllFilters}
                                className="mt-2 underline text-sky-600 hover:text-sky-700"
                              >
                                Clear all filters
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <Database
                                className="mb-2 text-gray-400"
                                size={32}
                              />
                              <p className="text-sm">No backups available</p>
                              <p className="mt-1 text-xs">
                                Create your first backup using the form above
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedBackups.map((backup) => (
                        <tr
                          key={backup.fileName}
                          className={`text-xs border border-gray-300 hover:bg-gray-50 cursor-pointer ${
                            selectedBackup?.fileName === backup.fileName
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() => handleBackupSelect(backup)}
                        >
                          <td className="text-center border-b border-gray-300">
                            <input
                              type="checkbox"
                              checked={selectedBackups.includes(backup.fileName)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelect(backup.fileName);
                              }}
                            />
                          </td>
                          <td className="px-2 py-3 border-b border-gray-300">
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-3 ${
                                  backup.format === "json"
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                              ></div>
                              <span className="text-sm font-medium text-gray-900">
                                {backup.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center border-b border-gray-300">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                backup.format === "json"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {backup.format.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-sm text-gray-500 border-b border-gray-300">
                            {formatFullDate(backup.created)}
                          </td>
                          <td className="px-2 py-3 text-sm text-gray-500 border-b border-gray-300">
                            {backup.size}
                          </td>
                          <td className="px-2 py-3 border-b border-gray-300">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBackupSelect(backup);
                                  setRestoreConfirm(true);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                                title="Restore this backup"
                              >
                                <RotateCcw size={12} />
                                Restore
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadBackup(backup);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white rounded bg-sky-600 hover:bg-sky-700"
                                title="Download this backup"
                              >
                                <Download size={12} />
                                Download
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBackupToDelete(backup);
                                  setDeleteConfirm(true);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                                title="Delete this backup"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalBackups}
                filteredItems={filteredCount}
                hasActiveFilters={hasActiveFilters}
                onPageChange={goToPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                startItem={startItem}
                endItem={endItem}
                storageKey="backups_list"
              />
            </div>
          </div>

          {/* Confirmation Dialogs */}
          <ConfirmationDialog
            open={confirmOpen}
            title="Confirm Backup Creation"
            message={`Are you sure you want to create a ${backupFormat.toUpperCase()} backup? This may take a few moments.`}
            loading={processing && processingAction === "backup"}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleBackup}
            confirmText="Create Backup"
            cancelText="Cancel"
            confirmColor="sky"
          />

          <ConfirmationDialog
            open={restoreConfirm}
            title="Confirm Database Restore"
            message={
              <div>
                <p className="mb-2 font-semibold text-red-600">
                  WARNING: This action cannot be undone!
                </p>
                <p className="mb-2">Restoring will:</p>
                <ul className="mb-3 ml-4 text-sm list-disc">
                  <li>Overwrite all existing data</li>
                  <li>Replace current database contents</li>
                  <li>Potentially cause data loss</li>
                </ul>
                <p className="text-sm">
                  <strong>Backup to restore:</strong>{" "}
                  {selectedBackup?.fileName || restoreFileName}
                </p>
                <p className="mt-2">Are you sure you want to continue?</p>
              </div>
            }
            loading={processing && processingAction === "restore"}
            onCancel={() => {
              setRestoreConfirm(false);
              setSelectedBackup(null);
            }}
            onConfirm={handleRestore}
            confirmText="Yes, Restore Now"
            cancelText="Cancel"
            confirmColor="red"
            size="md"
          />

          <ConfirmationDialog
            open={deleteConfirm}
            title="Confirm Backup Deletion"
            message={`Are you sure you want to delete backup "${backupToDelete?.fileName}"? This action cannot be undone.`}
            loading={processing && processingAction === "delete"}
            onCancel={() => {
              setDeleteConfirm(false);
              setBackupToDelete(null);
            }}
            onConfirm={handleDeleteBackup}
            confirmText="Delete Backup"
            cancelText="Cancel"
            confirmColor="red"
          />
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
};

export default DatabaseBackup;
