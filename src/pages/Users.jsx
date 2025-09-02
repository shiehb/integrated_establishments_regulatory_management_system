import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
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
        <div>
          {/* Users List */}
          <UsersList
            onAdd={() => setShowAdd(true)}
            onEdit={(u) => setEditUser(u)}
          />

          {/* Add User Modal */}
          {showAdd && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <AddUser onClose={() => setShowAdd(false)} />
            </div>
          )}

          {/* Edit User Modal */}
          {editUser && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <EditUser user={editUser} onClose={() => setEditUser(null)} />
            </div>
          )}
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
