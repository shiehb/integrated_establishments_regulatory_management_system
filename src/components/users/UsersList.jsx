import { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil, UserCheck, UserX, Plus } from "lucide-react";
import api from "../../services/api"; // now works ✅

export default function UsersList({ onAdd, onEdit }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api
      .get("users/") // calls /api/users/
      .then((res) => {
        const mappedUsers = res.data.map((u) => ({
          id: u.id,
          fullName: `${u.first_name} ${u.middle_name || ""} ${u.last_name}`,
          email: u.email,
          role: `${u.userlevel} ${u.section ? "- " + u.section : ""}`,
          active: true, // TODO: replace with real status when added
          createdDate: new Date(u.date_joined).toDateString(),
          updatedDate: new Date().toDateString(),
        }));
        setUsers(mappedUsers);
      })
      .catch(() => setUsers([]));
  }, []);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

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

      {/* Table */}
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
          {users.length > 0 ? (
            users.map((u) => (
              <tr
                key={u.id}
                className="p-1 text-xs border border-gray-300 hover:bg-gray-50"
              >
                <td className="px-2 font-semibold border border-gray-300">
                  {u.fullName}
                </td>
                <td className="px-2 border border-gray-300">{u.email}</td>
                <td className="px-2 border border-gray-300">{u.role}</td>
                <td className="px-2 border border-gray-300">{u.createdDate}</td>
                <td className="px-2 border border-gray-300">{u.updatedDate}</td>
                <td className="px-2 text-center border border-gray-300 w-28">
                  <span
                    className={`inline-block w-20 px-2 py-1 rounded text-xs font-semibold text-center ${
                      u.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.active ? "Active" : "Inactive"}
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
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="px-4 py-6 text-sm text-center text-gray-500 border border-gray-300"
              >
                There are no records to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
              onEdit(user);
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
            {user.active ? (
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
              Are you sure you want to {user.active ? "deactivate" : "activate"}{" "}
              <span className="font-bold">{user.fullName}</span>?
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
                  user.active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                {user.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
