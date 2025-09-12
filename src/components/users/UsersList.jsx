import { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil, UserCheck, UserX, Plus } from "lucide-react";
import api, { toggleUserActive } from "../../services/api";

export default function UsersList({ onAdd, onEdit, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map section codes to display names
  const sectionDisplayNames = {
    "PD-1586": "PD-1586",
    "RA-6969": "RA-6969",
    "RA-8749": "RA-8749",
    "RA-9275": "RA-9275",
    "RA-9003": "RA-9003",
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

  // UsersList.jsx - update the toggleStatus function
  const toggleStatus = async (id) => {
    try {
      await toggleUserActive(id);

      // Show success notification
      if (window.showNotification) {
        const user = users.find((u) => u.id === id);
        const action = user.is_active ? "deactivated" : "activated";
        window.showNotification("success", `User ${action} successfully!`);
      }

      fetchUsers();
    } catch (err) {
      setLoading(false);

      // Show error notification
      if (window.showNotification) {
        window.showNotification(
          "error",
          "Failed to update user status: " +
            (err.response?.data?.detail || err.message)
        );
      }
    }
  };

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-sky-600">Users</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-2 py-2 text-white rounded-lg bg-sky-600 hover:bg-sky-700"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* If no users */}
      {users.length === 0 ? (
        <p className="p-4 text-center text-gray-500">
          There are no records to display.
        </p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="text-sm text-center text-white bg-sky-700">
              <th className="p-1 border border-gray-300">Fullname</th>
              <th className="p-1 border border-gray-300">Email</th>
              <th className="p-1 border border-gray-300">Role</th>
              <th className="p-1 border border-gray-300">Created Date</th>
              <th className="p-1 text-center border border-gray-300">
                Updated Date
              </th>
              <th className="p-1 border border-gray-300 w-28">Status</th>
              <th className="p-1 text-right border border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="p-1 text-xs border border-gray-300 hover:bg-gray-50"
              >
                <td className="px-2 font-semibold border border-gray-300">
                  {u.first_name} {u.middle_name} {u.last_name}
                </td>
                <td className="px-2 border border-gray-300">{u.email}</td>
                <td className="px-2 border border-gray-300">
                  {u.userlevel}
                  {u.section
                    ? ` - ${sectionDisplayNames[u.section] || u.section}`
                    : ""}
                </td>
                <td className="px-2 border border-gray-300">
                  {new Date(u.date_joined).toDateString()}
                </td>
                <td className="px-2 border border-gray-300">
                  {new Date().toDateString()}
                </td>
                <td className="px-2 text-center border border-gray-300 w-28">
                  <span
                    className={`inline-block w-20 px-2 py-1 rounded text-xs font-semibold text-center ${
                      u.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="relative w-10 p-1 text-center border border-gray-300">
                  <Menu
                    user={u}
                    onEdit={onEdit}
                    onToggleStatus={toggleStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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

  const handleStatusClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onToggleStatus(user.id);
    setShowConfirm(false);
    setOpen(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

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
