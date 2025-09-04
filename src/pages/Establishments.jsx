import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import EstablishmentList from "../components/establishments/EstablishmentList";
import AddEstablishment from "../components/establishments/AddEstablishment";
import EditEstablishment from "../components/establishments/EditEstablishment";

export default function Establishments() {
  const [showAdd, setShowAdd] = useState(false);
  const [editEstablishment, setEditEstablishment] = useState(null);

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div>
          {/* Establishments List */}
          <EstablishmentList
            onAdd={() => setShowAdd(true)}
            onEdit={(est) => setEditEstablishment(est)}
          />

          {/* Add Establishment Modal */}
          {showAdd && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <AddEstablishment onClose={() => setShowAdd(false)} />
            </div>
          )}

          {/* Edit Establishment Modal */}
          {editEstablishment && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <EditEstablishment
                establishment={editEstablishment}
                onClose={() => setEditEstablishment(null)}
              />
            </div>
          )}
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
