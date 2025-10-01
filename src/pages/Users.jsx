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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshUsers = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div>
          {/* Users List */}
          <UsersList
            onAdd={() => setShowAdd(true)}
            onEdit={(u) => setEditUser(u)}
            refreshTrigger={refreshTrigger}
          />

          {/* Add User Modal */}
          {showAdd && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <AddUser
                onClose={() => setShowAdd(false)}
                onUserAdded={refreshUsers}
              />
            </div>
          )}

          {/* Edit User Modal */}
          {editUser && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <EditUser
                userData={editUser}
                onClose={() => setEditUser(null)}
                onUserUpdated={refreshUsers}
              />
            </div>
          )}
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
