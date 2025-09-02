import { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil, UserCheck, UserX, Plus } from "lucide-react";

export default function UsersList({ onAdd, onEdit }) {
  const [users, setUsers] = useState([
    {
      id: 1,
      fullName: "MARVIJOHN MABALOT M.",
      email: "marvi@example.com",
      role: "DivisionChief",
      active: true,
      createdDate: "2025-08-01",
      updatedDate: "2025-08-15",
    },
    {
      id: 2,
      fullName: "HARRY",
      email: "hari@example.com",
      role: "MonitoringPersonel",
      active: false,
      createdDate: "2025-08-05",
      updatedDate: "2025-08-20",
    },
  ]);

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
      <table className="w-full  border-collapse">
        <thead>
          <tr className="text-left text-white bg-sky-700 text-sm">
            <th className="p-1">Fullname</th>
            <th className="p-1">Email</th>
            <th className="p-1">Role</th>
            <th className="p-1">Status</th>
            <th className="p-1">Created Date</th>
            <th className="p-1">Updated Date</th>

            <th className="p-1 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-b-1 p-1 font-semibold border-gray-400 hover:bg-gray-50 text-sm"
            >
              <td className=" pl-4">{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    u.active
                      ? "bg-green-100 text-green-700 "
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>{u.createdDate}</td>
              <td>{u.updatedDate}</td>

              <td className="relative p-1 text-right">
                <Menu user={u} onEdit={onEdit} onToggleStatus={toggleStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Dropdown Menu Component */
function Menu({ user, onEdit, onToggleStatus }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1 rounded-full text-black bg-transparent hover:bg-gray-200"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute z-10 w-48 mt-2 bg-white border shadow-lg right-0">
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
            onClick={() => {
              const action = user.active ? "deactivate" : "activate";
              if (
                window.confirm(
                  `Are you sure you want to ${action} ${user.fullName}?`
                )
              ) {
                onToggleStatus(user.id);
              }
              setOpen(false);
            }}
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
    </div>
  );
}
