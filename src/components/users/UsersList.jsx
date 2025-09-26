import { useState, useEffect, useRef, useMemo } from "react";
import {
  MoreVertical,
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
} from "lucide-react";
import api, { toggleUserActive } from "../../services/api";
import ExportModal from "../ExportModal";
import ConfirmationDialog from "../common/ConfirmationDialog";
// Move sectionDisplayNames outside the component to avoid dependency issues
const sectionDisplayNames = {
  "PD-1586": "Environmental Impact Assessment",
  "RA-6969": "Toxic Substances and Hazardous Waste Act",
  "RA-8749": "Clean Air Act",
  "RA-9275": "Clean Water Act",
  "RA-9003": "Solid Waste Management Act",
};

export default function UsersList({ onAdd, onEdit, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Local search state
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ✅ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // ✅ Bulk select
  const [selectedUsers, setSelectedUsers] = useState([]);

  // 📤 Export Modal
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("auth/list/");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

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
    setSortDropdownOpen(false);
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

  // ✅ Filter + Sort with LOCAL search
  const filteredUsers = useMemo(() => {
    let list = users.filter((u) => {
      // Apply local search filter
      const query = localSearchQuery.toLowerCase();
      const fullName =
        `${u.first_name} ${u.middle_name} ${u.last_name}`.toLowerCase();
      const matchesSearch = localSearchQuery
        ? fullName.includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.userlevel?.toLowerCase().includes(query) ||
          (u.section &&
            sectionDisplayNames[u.section]?.toLowerCase().includes(query))
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

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === "fullname") {
          aVal =
            `${a.first_name} ${a.middle_name} ${a.last_name}`.toLowerCase();
          bVal =
            `${b.first_name} ${b.middle_name} ${b.last_name}`.toLowerCase();
        } else {
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
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
    localSearchQuery,
    roleFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortConfig,
    sectionDisplayNames,
  ]); // Added sectionDisplayNames to dependencies

  // ✅ Selection
  const toggleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
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
  const clearLocalSearch = () => setLocalSearchQuery("");
  const clearAllFilters = () => {
    setLocalSearchQuery("");
    setRoleFilter([]);
    setStatusFilter([]);
    setDateFrom("");
    setDateTo("");
    setSortConfig({ key: null, direction: null });
  };

  const handleSortFromDropdown = (fieldKey, directionKey) => {
    if (fieldKey) {
      setSortConfig({ key: fieldKey, direction: directionKey || "asc" });
    } else {
      setSortConfig({ key: null, direction: null });
    }
    setSortDropdownOpen(false);
  };

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  const totalUsers = users.length;
  const filteredCount = filteredUsers.length;
  const hasActiveFilters =
    localSearchQuery ||
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

  return (
    <div className="p-4 bg-white rounded shadow ">
      {/* Top controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Users Management</h1>

        <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto">
          {/* 🔍 Local Search Bar */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full min-w-sm py-1 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            {localSearchQuery && (
              <button
                onClick={clearLocalSearch}
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
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <ArrowUpDown size={14} />
              Sort by {/* Always shows "Sort by" */}
              <ChevronDown size={14} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 z-20 w-40 p-2 mt-2 bg-white border rounded shadow">
                {/* Sort by Field Section */}
                <div className="mb-2">
                  <h4 className="px-3 py-1 text-sm font-semibold text-gray-600">
                    Sort by
                  </h4>
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
                      className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                        sortConfig.key === field.key
                          ? "bg-sky-50 font-medium"
                          : ""
                      }`}
                    >
                      <span className="text-xs text-sky-600 mr-2">
                        {sortConfig.key === field.key ? "•" : ""}
                      </span>
                      <span>{field.label}</span>
                    </button>
                  ))}
                </div>

                {/* Order Section - Shown if a field is selected */}
                {sortConfig.key && (
                  <>
                    <div className="my-1 border-t border-gray-200"></div>
                    <div>
                      <h4 className="px-3 py-1 text-sm font-semibold text-gray-600">
                        Order
                      </h4>
                      {sortDirections.map((dir) => (
                        <button
                          key={dir.key}
                          onClick={() =>
                            handleSortFromDropdown(sortConfig.key, dir.key)
                          }
                          className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                            sortConfig.direction === dir.key
                              ? "bg-sky-50 font-medium"
                              : ""
                          }`}
                        >
                          <span className="text-xs text-sky-600 mr-2">
                            {sortConfig.direction === dir.key ? "•" : ""}
                          </span>
                          <span>{dir.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 🎚 Filters dropdown */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Filter size={14} /> Filters
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>

            {filtersOpen && (
              <div className="absolute right-0 z-20 w-82 p-2 mt-2 bg-white border rounded shadow">
                {/* Role Section */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-600">
                      Role
                    </h4>
                    {roleFilter.length > 0 && (
                      <button
                        onClick={() => setRoleFilter([])}
                        className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
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
                      className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                        roleFilter.includes(role) ? "bg-sky-50 font-medium" : ""
                      }`}
                    >
                      <span className="text-xs text-sky-600 mr-2">
                        {roleFilter.includes(role) ? "•" : ""}
                      </span>
                      <span>{role}</span>
                    </button>
                  ))}
                </div>

                {/* Status Section */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-600">
                      Status
                    </h4>
                    {statusFilter.length > 0 && (
                      <button
                        onClick={() => setStatusFilter([])}
                        className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {["Active", "Inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`flex items-center w-full px-3 py-2 text-sm text-left rounded hover:bg-gray-100 ${
                        statusFilter.includes(status)
                          ? "bg-sky-50 font-medium"
                          : ""
                      }`}
                    >
                      <span className="text-xs text-sky-600 mr-2">
                        {statusFilter.includes(status) ? "•" : ""}
                      </span>
                      <span>{status}</span>
                    </button>
                  ))}
                </div>

                {/* Date Range Section */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-600">
                      Date Range
                    </h4>
                    {(dateFrom || dateTo) && (
                      <button
                        onClick={() => {
                          setDateFrom("");
                          setDateTo("");
                        }}
                        className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded"
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Download size={14} /> Export ({selectedUsers.length})
            </button>
          )}

          <button
            onClick={onAdd}
            className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300 rounded-lg ">
        <thead>
          <tr className="text-sm text-left text-white bg-sky-700">
            <th className="w-6 p-1 text-center border border-gray-300">
              <input
                type="checkbox"
                checked={
                  selectedUsers.length > 0 &&
                  selectedUsers.length === filteredUsers.length
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
                className={`p-1 border border-gray-300 ${
                  col.sortable ? "cursor-pointer" : ""
                }`}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {col.label} {col.sortable && getSortIcon(col.key)}
                </div>
              </th>
            ))}

            <th className="p-1 text-right border border-gray-300"></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                className="px-2 py-4 text-center text-gray-500 border border-gray-300"
              >
                {hasActiveFilters ? (
                  <div>
                    No users found matching your criteria.
                    <br />
                    <button
                      onClick={clearAllFilters}
                      className="mt-2 text-sky-600 hover:text-sky-700 underline"
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
            filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="p-1 text-xs border border-gray-300 hover:bg-gray-50 "
              >
                <td className="text-center border border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={() => toggleSelect(u.id)}
                  />
                </td>
                <td className="px-2 font-semibold border border-gray-300">
                  {u.first_name} {u.middle_name} {u.last_name}
                </td>
                <td className="px-2 underline border border-gray-300">
                  {u.email}
                </td>
                <td className="px-2 border border-gray-300">
                  {u.userlevel}
                  {u.section
                    ? ` - ${sectionDisplayNames[u.section] || u.section}`
                    : ""}
                </td>
                <td className="px-2 text-center border border-gray-300 w-28">
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
                <td className="px-2 border border-gray-300">
                  {formatFullDate(u.date_joined)}
                </td>
                <td className="px-2 border border-gray-300">
                  {u.updated_at
                    ? formatFullDate(u.updated_at)
                    : "Never updated"}
                </td>
                <td className="relative w-10 p-1 text-center border border-gray-300">
                  <Menu
                    user={u}
                    onEdit={onEdit}
                    onToggleStatus={toggleUserActive}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 📊 Search results info */}
      {(hasActiveFilters || filteredCount !== totalUsers) && (
        <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
          <div>
            Showing {filteredCount} of {totalUsers} user(s)
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sky-600 hover:text-sky-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Users Export Report"
        fileName="users_export"
        companyName="DENR Environmental Office"
        companySubtitle="User Management System"
        logo="/logo.png"
        columns={["Fullname", "Email", "Role", "Status", "Created", "Updated"]}
        rows={selectedUsers.map((id) => {
          const u = users.find((x) => x.id === id);
          return [
            `${u.first_name} ${u.middle_name} ${u.last_name}`,
            u.email,
            u.userlevel,
            u.is_active ? "Active" : "Inactive",
            formatFullDate(u.date_joined),
            u.updated_at ? formatFullDate(u.updated_at) : "Never updated",
          ];
        })}
      />
    </div>
  );
}

/* Dropdown Menu Component */
function Menu({ user, onEdit, onToggleStatus }) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setShowConfirm(false);
      }
    }
    if (open || showConfirm) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, showConfirm]);

  const handleStatusClick = () => {
    setShowConfirm(true);
    setOpen(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onToggleStatus(user.id);

      // Show success notification
      if (window.showNotification) {
        window.showNotification(
          "success",
          `User ${user.is_active ? "deactivated" : "activated"} successfully!`
        );
      }
    } catch (error) {
      // Show error notification
      if (window.showNotification) {
        window.showNotification(
          "error",
          `Failed to ${user.is_active ? "deactivate" : "activate"} user: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const actionText = user.is_active ? "Deactivate" : "Activate";
  const actionColor = user.is_active ? "red" : "green";

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1 text-black bg-transparent rounded-full hover:bg-gray-200 transition-colors"
        title="User actions"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-36">
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
              setOpen(false);
            }}
            className="flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-gray-50 text-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
          >
            <Pencil size={16} />
            <span>Edit</span>
          </button>
          <button
            onClick={handleStatusClick}
            className={`flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
              user.is_active ? "text-red-600" : "text-green-600"
            }`}
          >
            {user.is_active ? (
              <>
                <UserX size={16} />
                <span>Deactivate User</span>
              </>
            ) : (
              <>
                <UserCheck size={16} />
                <span>Activate User</span>
              </>
            )}
          </button>
        </div>
      )}

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
        confirmColor={actionColor}
      />
    </div>
  );
}
