import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Pencil,
  UserCheck,
  UserX,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api, { toggleUserActive } from "../../services/api";
import ExportDropdown from "../ExportDropdown";
import PrintPDF from "../PrintPDF";
import DateRangeDropdown from "../DateRangeDropdown";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useNotifications } from "../NotificationManager";
import PaginationControls, { useLocalStoragePagination } from "../PaginationControls";

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

// Section options depending on role
const sectionOptionsByLevel = {
  "Section Chief": [
    {
      value: "PD-1586,RA-8749,RA-9275",
      label: "EIA, Air & Water Quality Monitoring Section",
    },
    {
      value: "RA-6969",
      label: "Toxic Chemicals & Hazardous Monitoring Section",
    },
    { value: "RA-9003", label: "Ecological Solid Waste Management Section" },
  ],
  "Unit Head": [
    { value: "PD-1586", label: "EIA Monitoring Unit" },
    { value: "RA-8749", label: "Air Quality Monitoring Unit" },
    { value: "RA-9275", label: "Water Quality Monitoring Unit" },
  ],
  "Monitoring Personnel": [
    { value: "PD-1586", label: "EIA Monitoring Personnel" },
    { value: "RA-8749", label: "Air Quality Monitoring Personnel" },
    { value: "RA-9275", label: "Water Quality Monitoring Personnel" },
    { value: "RA-6969", label: "Toxic Chemicals Monitoring Personnel" },
    { value: "RA-9003", label: "Solid Waste Monitoring Personnel" },
  ],
};

// Create comprehensive section display mapping with role context
const getSectionDisplayName = (sectionValue, userlevel) => {
  if (!sectionValue) return "";

  // First, check if this section exists in the userlevel's options
  if (userlevel && sectionOptionsByLevel[userlevel]) {
    const sectionOption = sectionOptionsByLevel[userlevel].find(
      (opt) => opt.value === sectionValue
    );
    if (sectionOption) {
      return sectionOption.label;
    }
  }

  // Fallback mapping for when userlevel is not available
  const fallbackMap = {
    "PD-1586,RA-8749,RA-9275": "EIA, Air & Water Quality Monitoring Section",
    "RA-6969": "Toxic Chemicals & Hazardous Monitoring Section",
    "RA-9003": "Ecological Solid Waste Management Section",
    "PD-1586": "EIA Monitoring",
    "RA-8749": "Air Quality Monitoring",
    "RA-9275": "Water Quality Monitoring",
  };

  const baseName = fallbackMap[sectionValue] || sectionValue;

  // Add appropriate suffix based on common patterns
  if (sectionValue === "RA-6969") {
    return "Toxic Chemicals & Hazardous Monitoring Section";
  } else if (sectionValue === "RA-9003") {
    return "Ecological Solid Waste Management Section";
  }

  return baseName;
};

// Add user role display names
const userRoleDisplayNames = {
  "Legal Unit": "Legal Unit",
  "Division Chief": "Division Chief",
  "Section Chief": "Section Chief",
  "Unit Head": "Unit Head",
  "Monitoring Personnel": "Monitoring Personnel",
};

// Helper function to get full role display with section
const getRoleDisplay = (userlevel, section) => {
  const roleDisplay = userRoleDisplayNames[userlevel] || userlevel || "";

  if (section) {
    const sectionDisplay = getSectionDisplayName(section, userlevel);
    return `${roleDisplay} - ${sectionDisplay}`;
  }

  return roleDisplay;
};

export default function UsersList({ onAdd, onEdit, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ✅ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // ✅ Pagination with localStorage
  const savedPagination = useLocalStoragePagination("users_list");
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);

  // ✅ Bulk select
  const [selectedUsers, setSelectedUsers] = useState([]);

  // 📤 Export Modal

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      // Add search parameter if provided
      if (debouncedSearchQuery) {
        params.append("search", debouncedSearchQuery);
      }

      // Add role filter if selected
      if (roleFilter.length > 0) {
        params.append("role", roleFilter.join(","));
      }

      // Add status filter if selected
      if (statusFilter.length > 0) {
        params.append("status", statusFilter.join(","));
      }

      const res = await api.get(`auth/list/?${params.toString()}`);

      if (res.data.results) {
        // Server-side paginated response
        setUsers(res.data.results);
        setTotalCount(res.data.count || 0);
      } else {
        // Fallback for non-paginated response
        setUsers(res.data);
        setTotalCount(res.data.length);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, roleFilter, statusFilter]);

  // Fetch all users on component mount and when pagination/filters change
  useEffect(() => {
    fetchAllUsers();
  }, [refreshTrigger, fetchAllUsers]);

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
    // Removed auto-close: setSortDropdownOpen(false);
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
    { key: "fullname", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "date_joined", label: "Date Joined" },
    { key: "updated_at", label: "Last Updated" },
  ];

  const sortDirections = [
    { key: "asc", label: "Ascending" },
    { key: "desc", label: "Descending" },
  ];

  // ✅ Filter + Sort with LOCAL search (client-side only)
  const filteredUsers = useMemo(() => {
    let list = users.filter((u) => {
      // Apply local search filter
      const query = debouncedSearchQuery.toLowerCase();
      const fullName = `${u.first_name || ""} ${u.middle_name || ""} ${
        u.last_name || ""
      }`.toLowerCase();
      const userRoleDisplay =
        userRoleDisplayNames[u.userlevel] || u.userlevel || "";
      const sectionDisplay =
        getSectionDisplayName(u.section, u.userlevel) || "";
      const roleWithSection = getRoleDisplay(u.userlevel, u.section) || "";

      const matchesSearch = debouncedSearchQuery
        ? fullName.includes(query) ||
          (u.email || "").toLowerCase().includes(query) ||
          userRoleDisplay.toLowerCase().includes(query) ||
          sectionDisplay.toLowerCase().includes(query) ||
          roleWithSection.toLowerCase().includes(query)
        : true;

      // Apply role filter
      const matchesRole =
        roleFilter.length === 0 || roleFilter.includes(u.userlevel);

      // Apply status filter
      const matchesStatus =
        statusFilter.length === 0
          ? true
          : statusFilter.includes(u.is_active ? "Active" : "Inactive");

      // Apply date filter
      const matchesDateFrom = dateFrom
        ? new Date(u.date_joined) >= new Date(dateFrom)
        : true;
      const matchesDateTo = dateTo
        ? new Date(u.date_joined) <= new Date(dateTo)
        : true;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });

    // Apply sorting
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === "fullname") {
          aVal = `${a.first_name || ""} ${a.middle_name || ""} ${
            a.last_name || ""
          }`.toLowerCase();
          bVal = `${b.first_name || ""} ${b.middle_name || ""} ${
            b.last_name || ""
          }`.toLowerCase();
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
  }, [
    users,
    debouncedSearchQuery,
    roleFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortConfig,
  ]);

  // ✅ Pagination (using server-side pagination, so no need for paginatedUsers)

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // ✅ Selection
  const toggleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  // Toggle role & status filter checkboxes
  const toggleRole = (role) =>
    setRoleFilter((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const toggleStatus = (status) =>
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );

  // Clear functions
  const clearSearch = () => setSearchQuery("");
  const clearAllFilters = () => {
    setSearchQuery("");
    setRoleFilter([]);
    setStatusFilter([]);
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
    // Removed auto-close: setSortDropdownOpen(false);
  };

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const totalUsers = totalCount;
  const filteredCount = totalCount; // Server-side filtering
  const hasActiveFilters =
    searchQuery ||
    roleFilter.length > 0 ||
    statusFilter.length > 0 ||
    dateFrom ||
    dateTo ||
    sortConfig.key;
  const activeFilterCount =
    roleFilter.length +
    statusFilter.length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  // Calculate display range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredCount);

  return (
    <div className="p-4 bg-white h-[calc(100vh-160px)]">
      {/* Top controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Users Management</h1>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* 🔍 Local Search Bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search users..."
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

          {/* 🔽 Sort Dropdown - Simplified to always show "Sort by" */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              <ArrowUpDown size={14} />
              Sort by {/* Always shows "Sort by" */}
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
               <ArrowUpDown size={14} />
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
                    {(roleFilter.length > 0 || statusFilter.length > 0) && (
                      <button
                        onClick={() => {
                          setRoleFilter([]);
                          setStatusFilter([]);
                        }}
                        className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {/* Role Section */}
                  <div className="mb-3">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      User Role
                    </div>
                    {[
                      "Legal Unit",
                      "Division Chief",
                      "Section Chief",
                      "Unit Head",
                      "Monitoring Personnel",
                    ].map((role) => (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          roleFilter.includes(role) ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{userRoleDisplayNames[role] || role}</div>
                        </div>
                        {roleFilter.includes(role) && (
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Status Section */}
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      User Status
                    </div>
                    {["Active", "Inactive"].map((status) => (
                      <button
                        key={status}
                        onClick={() => toggleStatus(status)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                          statusFilter.includes(status) ? "bg-sky-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{status}</div>
                        </div>
                        {statusFilter.includes(status) && (
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
            className=" absolute right-0 flex items-center text-sm"
          />

          <ExportDropdown
            title="Users Export Report"
            fileName="users_export"
            columns={["ID", "Name", "Email", "User Level", "Section", "Status", "Date Created"]}
            rows={selectedUsers.length > 0 ? 
              selectedUsers.map(user => [
                user.id,
                `${user.first_name} ${user.last_name}`,
                user.email,
                user.userlevel,
                user.section || "N/A",
                user.is_active ? "Active" : "Inactive",
                new Date(user.date_joined).toLocaleDateString()
              ]) : 
              users.map(user => [
                user.id,
                `${user.first_name} ${user.last_name}`,
                user.email,
                user.userlevel,
                user.section || "N/A",
                user.is_active ? "Active" : "Inactive",
                new Date(user.date_joined).toLocaleDateString()
              ])
            }
            disabled={users.length === 0}
            className="flex items-center text-sm"
          />

          <PrintPDF
            title="Users Report"
            fileName="users_report"
            columns={["ID", "Name", "Email", "User Level", "Section", "Status", "Date Created"]}
            rows={selectedUsers.length > 0 ? 
              selectedUsers.map(user => [
                user.id,
                `${user.first_name} ${user.last_name}`,
                user.email,
                user.userlevel,
                user.section || "N/A",
                user.is_active ? "Active" : "Inactive",
                new Date(user.date_joined).toLocaleDateString()
              ]) : 
              users.map(user => [
                user.id,
                `${user.first_name} ${user.last_name}`,
                user.email,
                user.userlevel,
                user.section || "N/A",
                user.is_active ? "Active" : "Inactive",
                new Date(user.date_joined).toLocaleDateString()
              ])
            }
            selectedCount={selectedUsers.length}
            disabled={users.length === 0}
            className="flex items-center px-3 py-1 text-sm"
          />

          <button
            onClick={onAdd}
            className="flex items-center px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* 📊 Search results info */}
      {(hasActiveFilters || filteredCount !== totalUsers) && (
        <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
          <div>
            {filteredCount === totalUsers
              ? `Showing all ${totalUsers} user(s)`
              : `Showing ${filteredCount} of ${totalUsers} user(s)`}
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

       {/* Table */}
       <table className="w-full border border-gray-300 rounded-lg">
         <thead>
           <tr className="text-sm text-left text-white bg-sky-700">
             <th className="w-6 p-1 text-center border-b border-gray-300">
               <input
                 type="checkbox"
                 checked={
                   selectedUsers.length > 0 &&
                   selectedUsers.length === users.length
                 }
                 onChange={toggleSelectAll}
               />
             </th>
             {[
               { key: "fullname", label: "Fullname", sortable: true },
               { key: "email", label: "Email", sortable: false },
               { key: "userlevel", label: "Role", sortable: false },
               { key: "is_active", label: "Status", sortable: false },
               { key: "date_joined", label: "Created Date", sortable: true },
               { key: "updated_at", label: "Updated Date", sortable: true },
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
           {loading ? (
             <tr>
               <td
                 colSpan="8"
                 className="px-2 py-8 text-center border-b border-gray-300"
               >
                 <div
                   className="flex flex-col items-center justify-center p-4"
                   role="status"
                   aria-live="polite"
                 >
                   <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                   <p className="text-sm text-gray-600">Loading users...</p>
                 </div>
               </td>
             </tr>
           ) : users.length === 0 ? (
             <tr>
               <td
                 colSpan="8"
                 className="px-2 py-4 text-center text-gray-500 border-b border-gray-300"
               >
                 {hasActiveFilters ? (
                   <div>
                     No users found matching your criteria.
                     <br />
                     <button
                       onClick={clearAllFilters}
                       className="mt-2 underline text-sky-600 hover:text-sky-700"
                     >
                       Clear all filters
                     </button>
                   </div>
                 ) : (
                   "No users found."
                 )}
               </td>
             </tr>
           ) : (
             users.map((u) => (
               <tr
                 key={u.id}
                 className="p-1 text-xs border-b border-gray-300 hover:bg-gray-50"
               >
                 <td className="text-center border-b border-gray-300">
                   <input
                     type="checkbox"
                     checked={selectedUsers.includes(u.id)}
                     onChange={() => toggleSelect(u.id)}
                   />
                 </td>
                 <td className="px-2 font-semibold border-b border-gray-300">
                   {u.first_name} {u.middle_name} {u.last_name}
                 </td>
                 <td className="px-2 underline border-b border-gray-300">
                   {u.email}
                 </td>
                 <td className="px-2 border-b border-gray-300">
                   {getRoleDisplay(u.userlevel, u.section)}
                 </td>
                 <td className="px-2 text-center border-b border-gray-300 w-28">
                   {u.is_active ? (
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs w-18 font-semibold border border-gray-400 rounded">
                       <span className="w-2 h-2 bg-green-500 rounded-full" />
                       <span className="text-green-700">Active</span>
                     </span>
                   ) : (
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs w-18 font-semibold border border-gray-400 rounded">
                       <span className="w-2 h-2 bg-red-500 rounded-full" />
                       <span className="text-red-700">Inactive</span>
                     </span>
                   )}
                 </td>
                 <td className="px-2 border-b border-gray-300">
                   {formatFullDate(u.date_joined)}
                 </td>
                 <td className="px-2 border-b border-gray-300">
                   {u.updated_at
                     ? formatFullDate(u.updated_at)
                     : "Never updated"}
                 </td>
                 <td className="p-1 text-center border-b border-gray-300">
                   <ActionButtons
                     user={u}
                     onEdit={onEdit}
                     onToggleStatus={toggleUserActive}
                     onStatusChange={fetchAllUsers}
                   />
                 </td>
               </tr>
             ))
           )}
         </tbody>
      </table>

       {/* Pagination Controls */}
       <PaginationControls
         currentPage={currentPage}
         totalPages={totalPages}
         pageSize={pageSize}
         totalItems={totalUsers}
         filteredItems={filteredCount}
         hasActiveFilters={hasActiveFilters}
         onPageChange={goToPage}
         onPageSizeChange={(newSize) => {
           setPageSize(newSize);
           setCurrentPage(1);
         }}
         startItem={startItem}
         endItem={endItem}
         storageKey="users_list"
       />

    </div>
  );
}

/* Action Buttons Component - Replaced dropdown with individual buttons */
function ActionButtons({ user, onEdit, onToggleStatus, onStatusChange }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const notifications = useNotifications();

  const handleStatusClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onToggleStatus(user.id);

      // Refresh the user list
      if (onStatusChange) {
        onStatusChange();
      }

      // Show success notification
      notifications.success(
        `User ${user.is_active ? "deactivated" : "activated"} successfully!`,
        {
          title: "User Status Updated",
          duration: 4000
        }
      );
    } catch (error) {
      // Show error notification
      notifications.error(
        `Failed to ${user.is_active ? "deactivate" : "activate"} user: ${
          error.response?.data?.message || error.message
        }`,
        {
          title: "Status Update Failed",
          duration: 8000
        }
      );
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const actionText = user.is_active ? "Deactivate" : "Activate";

  return (
    <div className="flex justify-center gap-1">
      {/* Edit Button - Sky color */}
      <button
        onClick={() => {
          onEdit({
            id: user.id,
            first_name: user.first_name || "",
            middle_name: user.middle_name || "",
            last_name: user.last_name || "",
            email: user.email,
            userlevel: user.userlevel || "",
            section: user.section || "",
          });
        }}
        className="flex items-center gap-1 px-2 py-1 text-xs text-white transition-colors rounded bg-sky-600 hover:bg-sky-700"
        title="Edit User"
      >
        <Pencil size={12} />
        <span>Edit</span>
      </button>

      {/* Status Toggle Button - Green for activate, Red for deactivate */}
      <button
        onClick={handleStatusClick}
        className={`flex items-center gap-1 px-2 py-1 text-xs w-22 text-white transition-colors rounded hover:opacity-90 ${
          user.is_active
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
        title={`${actionText} User`}
      >
        {user.is_active ? (
          <>
            <UserX size={12} />
            <span>Deactivate</span>
          </>
        ) : (
          <>
            <UserCheck size={12} />
            <span>Activate</span>
          </>
        )}
      </button>

      <ConfirmationDialog
        open={showConfirm}
        title={`${actionText} User`}
        message={
          <div>
            Are you sure you want to {actionText.toLowerCase()}{" "}
            <span className="font-semibold">
              {user.first_name} {user.last_name}
            </span>
            ?
            {user.is_active && (
              <p className="mt-2 text-sm text-amber-600">
                This user will no longer be able to access the system.
              </p>
            )}
          </div>
        }
        loading={loading}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        confirmText={actionText}
        cancelText="Cancel"
        confirmColor={user.is_active ? "red" : "green"}
      />
    </div>
  );
}
