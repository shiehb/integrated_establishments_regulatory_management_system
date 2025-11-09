import { useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LayoutWithSidebar from "../../components/LayoutWithSidebar";
import LawList from "../../components/laws/LawList";
import AddLawModal from "../../components/laws/AddLawModal";
import EditLawModal from "../../components/laws/EditLawModal";
import LawDetailsModal from "../../components/laws/LawDetailsModal";
import { LAWS } from "../../constants/inspectionform/lawsConstants";

const LAW_CATEGORY_MAP = {
  "PD-1586": "Environmental Impact Assessment",
  "RA-6969": "Hazardous & Nuclear Waste",
  "RA-8749": "Air Quality Management",
  "RA-9275": "Water Quality Management",
  "RA-9003": "Solid Waste Management",
};

const LAW_EFFECTIVE_DATE_MAP = {
  "PD-1586": "1978-06-11",
  "RA-6969": "1990-10-26",
  "RA-8749": "1999-06-23",
  "RA-9275": "2004-03-22",
  "RA-9003": "2001-01-26",
};

const buildInitialLaws = () =>
  LAWS.map((law, index) => ({
    id: `mock-${index + 1}`,
    law_title: law.fullName || law.label,
    reference_code: law.id,
    description: law.description || law.fullName || law.label,
    category: LAW_CATEGORY_MAP[law.id] || "Environmental Management",
    effective_date: LAW_EFFECTIVE_DATE_MAP[law.id] || "2000-01-01",
    status: "Active",
  }));

const normalizeLaw = (law) => ({
  ...law,
  id: law.id || `mock-${Date.now()}`,
});

export default function LawManagement() {
  const [laws, setLaws] = useState(() => buildInitialLaws());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editContext, setEditContext] = useState(null);
  const [viewLaw, setViewLaw] = useState(null);

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLaws(buildInitialLaws());
      setLoading(false);
    }, 150);
  };

  const handleStatusChange = (lawId, nextStatus) => {
    setLaws((prev) =>
      prev.map((law) =>
        law.id === lawId ? { ...law, status: nextStatus } : law
      )
    );
  };

  const handleLawAdded = (newLaw) => {
    setLaws((prev) => [normalizeLaw(newLaw), ...prev]);
  };

  const handleLawUpdated = (updatedLaw) => {
    setLaws((prev) =>
      prev.map((law) =>
        law.id === updatedLaw.id ? { ...law, ...updatedLaw } : law
      )
    );
  };

  const currentLawForEdit = useMemo(() => {
    if (!editContext) return null;
    const existing = laws.find((law) => law.id === editContext.id);
    return existing || editContext;
  }, [editContext, laws]);

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div>
          <LawList
            laws={laws}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
            onAdd={() => setAddOpen(true)}
            onEdit={(law) => setEditContext(law)}
            onView={setViewLaw}
            onStatusChange={handleStatusChange}
          />
        </div>
      </LayoutWithSidebar>
      <Footer />

      {addOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <AddLawModal
            onClose={() => setAddOpen(false)}
            onLawAdded={(law) => {
              handleLawAdded(law);
              setAddOpen(false);
            }}
          />
        </div>
      )}

      {currentLawForEdit && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <EditLawModal
            law={currentLawForEdit}
            onClose={() => setEditContext(null)}
            onLawUpdated={(law) => {
              handleLawUpdated(law);
              setEditContext(null);
            }}
          />
        </div>
      )}

      {viewLaw && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <LawDetailsModal law={viewLaw} onClose={() => setViewLaw(null)} />
        </div>
      )}
    </>
  );
}


