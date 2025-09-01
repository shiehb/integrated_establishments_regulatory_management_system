import { useState } from "react";
import Header from "../components/Header";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import UsersList from "../components/users/UsersList";
import AddUser from "../components/users/AddUser";
import EditUser from "../components/users/EditUser";

export default function Users() {
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div className="p-6 bg-white rounded-lg shadow-md">
          {/* Users List */}
          <UsersList
            onAdd={() => setShowAdd(true)}
            onEdit={(u) => setEditUser(u)}
          />

          {/* Add User Modal */}
          {showAdd && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <AddUser onClose={() => setShowAdd(false)} />
            </div>
          )}

          {/* Edit User Modal */}
          {editUser && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <EditUser user={editUser} onClose={() => setEditUser(null)} />
            </div>
          )}
        </div>
      </LayoutWithSidebar>
    </>
  );
}
