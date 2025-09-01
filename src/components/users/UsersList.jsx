import { useState } from "react";
import { MoreVertical, Pencil, UserCheck, UserX, Plus } from "lucide-react";

export default function UsersList({ onAdd, onEdit }) {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      active: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      active: false,
    },
  ]);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  return (
    <div className="p-4 bg-white shadow rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left bg-gray-100">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    u.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="relative p-2 text-right">
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

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-gray-200"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 w-48 mt-2 bg-white border rounded-lg shadow-lg">
          <button
            onClick={() => {
              onEdit(user);
              setOpen(false);
            }}
            className="flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-gray-100"
          >
            <Pencil size={16} className="text-blue-600" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              onToggleStatus(user.id);
              setOpen(false);
            }}
            className="flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-gray-100"
          >
            {user.active ? (
              <>
                <UserX size={16} className="text-red-600" />
                <span>Deactivate User</span>
              </>
            ) : (
              <>
                <UserCheck size={16} className="text-green-600" />
                <span>Activate User</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
