import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import BillingList from "../components/billing/BillingList";
import AddBilling from "../components/billing/AddBilling";
import EditBilling from "../components/billing/EditBilling";

export default function Billing() {
  const [showAdd, setShowAdd] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshBilling = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div>
          {/* Billing Records List */}
          <BillingList
            onAdd={() => setShowAdd(true)}
            onEdit={(bill) => setEditBill(bill)}
            refreshTrigger={refreshTrigger}
          />

          {/* Add Billing Modal */}
          {showAdd && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <AddBilling
                onClose={() => setShowAdd(false)}
                onAdded={refreshBilling}
              />
            </div>
          )}

          {/* Edit Billing Modal */}
          {editBill && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <EditBilling
                billData={editBill}
                onClose={() => setEditBill(null)}
                onUpdated={refreshBilling}
              />
            </div>
          )}
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
