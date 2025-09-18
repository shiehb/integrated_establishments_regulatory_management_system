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
} from "lucide-react";
import api, { toggleUserActive } from "../../services/api";
import ExportModal from "../ExportModal";

export default function UsersList({ onAdd, onEdit, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔎 Search
  const [search, setSearch] = useState("");

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ↕️ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // ✅ Bulk select
  const [selectedUsers, setSelectedUsers] = useState([]);

  // 📤 Export Modal
  const [showExportModal, setShowExportModal] = useState(false);

  const sectionDisplayNames = {
    "PD-1586": "Environmental Impact Assessment",
    "RA-6969": "Toxic Substances and Hazardous Waste Act",
    "RA-8749": "Clean Air Act",
    "RA-9275": "Clean Water Act",
    "RA-9003": "Solid Waste Management Act",
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

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

  // ✅ Search + Filter + Sort
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const fullName =
          `${u.first_name} ${u.middle_name} ${u.last_name}`.toLowerCase();
        return (
          fullName.includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        );
      })
      .filter((u) =>
        roleFilter.length > 0 ? roleFilter.includes(u.userlevel) : true
      )
      .filter((u) =>
        statusFilter.length > 0
          ? statusFilter.includes(u.is_active ? "Active" : "Inactive")
          : true
      )
      .filter((u) =>
        dateFrom ? new Date(u.date_joined) >= new Date(dateFrom) : true
      )
      .filter((u) =>
        dateTo ? new Date(u.date_joined) <= new Date(dateTo) : true
      )
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "fullname") {
          aVal = `${a.first_name} ${a.middle_name} ${a.last_name}`;
          bVal = `${b.first_name} ${b.middle_name} ${b.last_name}`;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [users, search, roleFilter, statusFilter, dateFrom, dateTo, sortConfig]);

  // Sorting handler
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

  // ✅ Bulk select
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

  // Auto-close delay for filter dropdown
  let filterTimeout = useRef(null);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Top controls */}
      <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Users Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* 🔎 Search bar */}
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2"
              size={16}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-1 pl-8 pr-2 text-sm border rounded"
            />
          </div>

          {/* 🎚 Filters dropdown */}
          <div className="relative">
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Filter size={14} /> Filters
            </button>

            {filtersOpen && (
              <div
                className="absolute right-0 z-20 p-3 mt-2 bg-white border rounded shadow w-82"
                onMouseEnter={() => {
                  if (filterTimeout.current)
                    clearTimeout(filterTimeout.current);
                }}
                onMouseLeave={() => {
                  filterTimeout.current = setTimeout(() => {
                    setFiltersOpen(false);
                  }, 300); // ⏳ delay in ms
                }}
              >
                {/* 🔘 Role + Clear All */}
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">Role</h4>
                  <button
                    onClick={() => {
                      setRoleFilter([]);
                      setStatusFilter([]);
                      setDateFrom("");
                      setDateTo("");
                      setSearch("");
                      setFiltersOpen(false);
                    }}
                    className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Clear All
                  </button>
                </div>
                {[
                  "Legal Unit",
                  "Division Chief",
                  "Section Chief",
                  "Unit Head",
                  "Monitoring Personnel",
                ].map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={roleFilter.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    {role}
                  </label>
                ))}

                {/* 🔘 Status */}
                <h4 className="mt-3 mb-1 text-sm font-semibold">Status</h4>
                {["Active", "Inactive"].map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={() => toggleStatus(status)}
                    />
                    {status}
                  </label>
                ))}

                {/* 🔘 Date Range side by side */}
                <h4 className="mt-3 mb-1 text-sm font-semibold">Date Range</h4>
                <div className="flex items-center gap-2 text-sm">
                  <label className="flex flex-col flex-1">
                    From
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="px-2 py-1 mt-1 border rounded"
                    />
                  </label>
                  <label className="flex flex-col flex-1">
                    To
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="px-2 py-1 mt-1 border rounded"
                    />
                  </label>
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
      {filteredUsers.length === 0 ? (
        <p className="p-4 text-center text-gray-500">
          There are no records to display.
        </p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg">
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
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="p-1 text-xs border border-gray-300 hover:bg-gray-50"
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
            ))}
          </tbody>
        </table>
      )}

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Users Export Report"
        fileName="users_export"
        companyName="DENR Environmental Office"
        companySubtitle="User Management System"
        logo="/logo.png" // can be URL or base64 (PNG/JPEG)
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

  const handleStatusClick = () => setShowConfirm(true);
  const handleConfirm = () => {
    onToggleStatus(user.id);
    setShowConfirm(false);
    setOpen(false);
  };
  const handleCancel = () => setShowConfirm(false);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1 text-black bg-transparent rounded-full hover:bg-gray-200"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 bg-white border shadow-lg min-w-36">
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
            className="flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-gray-200 hover:text-gray-600"
          >
            <Pencil size={16} />
            <span>Edit</span>
          </button>
          <button
            onClick={handleStatusClick}
            className="flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-gray-200 hover:text-gray-600"
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

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Confirm Action
            </h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to{" "}
              {user.is_active ? "deactivate" : "activate"}{" "}
              <span className="font-bold">
                {user.first_name} {user.last_name}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded text-white ${
                  user.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                {user.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
