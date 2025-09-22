import { useState, useMemo, useRef, useEffect } from "react";
import { Eye, Pencil, Filter } from "lucide-react";
import { useSearch } from "../../contexts/SearchContext";

export default function InspectionList({ inspections, onAdd, onEdit, onView }) {
  const { searchQuery } = useSearch();
  
  // Flatten the inspections to show each establishment in a separate row
  const flattenedInspections = inspections.flatMap((inspection) =>
    inspection.establishments.map((establishment) => ({
      id: inspection.id,
      establishment,
      section: inspection.section,
      status: inspection.status,
    }))
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const filterRef = useRef(null);

  // Add this useEffect to handle clicks outside the filter dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFiltersOpen(false);
      }
    }

    if (filtersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtersOpen]);

  // Filtering logic
  const filteredInspections = useMemo(() => {
    return flattenedInspections.filter((inspection) => {
      // Search filter
      const matchesSearch =
        inspection.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.establishment.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        inspection.establishment.address.street
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        inspection.establishment.address.city
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Section filter
      const matchesSection =
        sectionFilter.length === 0 ||
        sectionFilter.includes(inspection.section);

      // Status filter
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(inspection.status);

      return matchesSearch && matchesSection && matchesStatus;
    });
  }, [flattenedInspections, searchQuery, sectionFilter, statusFilter]);

  // Toggle functions for filters
  const toggleSection = (section) => {
    setSectionFilter((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header with search and filters */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-sky-600">Inspections</h1>
        <div className="flex items-center gap-2">

          {/* Filter button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Filter size={14} /> Filters
            </button>

            {filtersOpen && (
              <div className="absolute right-0 z-10 p-3 mt-2 bg-white border rounded shadow w-60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Filters</h4>
                  <button
                    onClick={() => {
                      setSectionFilter([]);
                      setStatusFilter([]);
                    }}
                    className="text-xs text-sky-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                {/* Section filter */}
                <h5 className="mt-2 mb-1 text-sm font-medium">Section</h5>
                {["PD-1586", "RA-6969", "RA-8749", "RA-9275", "RA-9003"].map(
                  (section) => (
                    <label
                      key={section}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={sectionFilter.includes(section)}
                        onChange={() => toggleSection(section)}
                      />
                      {section}
                    </label>
                  )
                )}

                {/* Status filter */}
                <h5 className="mt-3 mb-1 text-sm font-medium">Status</h5>
                {["PENDING", "IN PROGRESS", "COMPLETED", "CANCELLED"].map(
                  (status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={statusFilter.includes(status)}
                        onChange={() => toggleStatus(status)}
                      />
                      {status}
                    </label>
                  )
                )}
              </div>
            )}
          </div>

          <button
            onClick={onAdd}
            className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
          >
            + New Inspection
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="text-sm text-center text-white bg-sky-700">
            <th className="p-1 border">ID</th>
            <th className="p-1 border">Name</th>
            <th className="p-1 border">Address</th>
            <th className="p-1 border">Coordinates</th>
            <th className="p-1 border">Section</th>
            <th className="p-1 border">Status</th>
            <th className="p-1 border"></th>
          </tr>
        </thead>
        <tbody>
          {filteredInspections.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500">
                No inspections match your search criteria.
              </td>
            </tr>
          ) : (
            filteredInspections.map(
              ({ id, establishment, section, status }) => (
                <tr
                  key={`${id}-${establishment.id}`}
                  className="text-xs text-center hover:bg-gray-50"
                >
                  <td className="px-2 border border-gray-300">{id}</td>
                  <td className="px-2 border border-gray-300">
                    {establishment.name}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {`${establishment.address.street}, ${establishment.address.barangay}, ${establishment.address.city}, ${establishment.address.province}, ${establishment.address.postalCode}`}
                  </td>
                  <td className="px-2 border border-gray-300">
                    {`${establishment.coordinates.latitude}, ${establishment.coordinates.longitude}`}
                  </td>
                  <td className="px-2 border border-gray-300">{section}</td>
                  <td className="px-2 border border-gray-300">{status}</td>
                  <td className="relative p-1 text-center border border-gray-300 w-35">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          onView({
                            id,
                            establishments: [establishment],
                            section,
                            status,
                          })
                        }
                        className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() =>
                          onEdit({
                            id,
                            establishments: [establishment],
                            section,
                            status,
                          })
                        }
                        className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
