import { useState, useEffect, useMemo } from "react";
import {
  Pencil,
  Map,
  Plus,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";
import { getEstablishments } from "../../services/api";
import ExportModal from "../ExportModal";
import { useSearch } from "../../contexts/SearchContext";

export default function EstablishmentList({
  onAdd,
  onEdit,
  onPolygon,
  refreshTrigger,
  canEditEstablishments,
}) {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();

  // 🎚 Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [provinceFilter, setProvinceFilter] = useState([]);

  // ✅ Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // ✅ For export
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchEstablishments();
  }, [refreshTrigger]);

  // Add this useEffect to handle clicks outside the filter dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (filtersOpen && !e.target.closest(".filter-dropdown")) {
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

  const fetchEstablishments = async () => {
    setLoading(true);
    try {
      const data = await getEstablishments();
      setEstablishments(data);
    } catch (err) {
      console.error("Error fetching establishments:", err);
      if (window.showNotification) {
        window.showNotification("error", "Error fetching establishments");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  // Toggle province filter
  const toggleProvince = (province) => {
    setProvinceFilter((prev) =>
      prev.includes(province)
        ? prev.filter((p) => p !== province)
        : [...prev, province]
    );
  };

  // ✅ Filter + Sort
  const filteredEstablishments = useMemo(() => {
    let list = establishments.filter((e) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        e.name.toLowerCase().includes(query) ||
        `${e.street_building}, ${e.barangay}, ${e.city}, ${e.province}, ${e.postal_code}`
          .toLowerCase()
          .includes(query) ||
        e.nature_of_business.toLowerCase().includes(query) ||
        String(e.year_established).includes(query);

      const matchesProvince =
        provinceFilter.length === 0 || provinceFilter.includes(e.province);

      return matchesSearch && matchesProvince;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "name") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [establishments, searchQuery, provinceFilter, sortConfig]);

  // ✅ Selection
  const toggleSelect = (id) => {
    setSelectedEstablishments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEstablishments.length === filteredEstablishments.length) {
      setSelectedEstablishments([]);
    } else {
      setSelectedEstablishments(filteredEstablishments.map((e) => e.id));
    }
  };

  if (loading) {
    return <p className="p-4">Loading establishments...</p>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold text-sky-600">Establishments</h1>

        <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto">
          {/* 🎚 Filters dropdown */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Filter size={14} /> Filters
            </button>

            {filtersOpen && (
              <div className="absolute right-0 z-20 w-48 p-3 mt-2 bg-white border rounded shadow">
                {/* 🔘 Province + Clear All */}
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">Province</h4>
                  <button
                    onClick={() => {
                      setProvinceFilter([]);
                      setFiltersOpen(false);
                    }}
                    className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Clear All
                  </button>
                </div>
                {["LA UNION", "PANGASINAN", "ILOCOS SUR", "ILOCOS NORTE"].map(
                  (province) => (
                    <label
                      key={province}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={provinceFilter.includes(province)}
                        onChange={() => toggleProvince(province)}
                      />
                      {province}
                    </label>
                  )
                )}
              </div>
            )}
          </div>

          {selectedEstablishments.length > 0 && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Download size={14} /> Export ({selectedEstablishments.length})
            </button>
          )}
          {canEditEstablishments && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              <Plus size={16} /> Add Establishment
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="text-sm text-left text-white bg-sky-700">
            <th className="w-6 p-1 text-center border border-gray-300">
              <input
                type="checkbox"
                checked={
                  selectedEstablishments.length > 0 &&
                  selectedEstablishments.length ===
                    filteredEstablishments.length
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th
              className="p-1 border border-gray-300 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center gap-1">
                Name of Establishment {getSortIcon("name")}
              </div>
            </th>
            <th className="p-1 border border-gray-300">Address</th>
            <th className="p-1 text-center border border-gray-300">
              Coordinates
            </th>
            <th className="p-1 border border-gray-300">Nature of Business</th>
            <th
              className="p-1 text-center border border-gray-300 cursor-pointer"
              onClick={() => handleSort("year_established")}
            >
              <div className="flex items-center justify-center gap-1">
                Year Established {getSortIcon("year_established")}
              </div>
            </th>
            <th className="p-1 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEstablishments.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="px-2 py-4 text-center text-gray-500 border border-gray-300"
              >
                No establishments found.
              </td>
            </tr>
          ) : (
            filteredEstablishments.map((e) => (
              <tr
                key={e.id}
                className="p-1 text-xs border border-gray-300 hover:bg-gray-50"
              >
                <td className="text-center border border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedEstablishments.includes(e.id)}
                    onChange={() => toggleSelect(e.id)}
                  />
                </td>
                <td className="px-2 font-semibold border border-gray-300">
                  {e.name}
                </td>
                <td className="px-2 border border-gray-300">
                  {e.street_building}, {e.barangay}, {e.city}, {e.province},{" "}
                  {e.postal_code}
                </td>
                <td className="px-2 text-center border border-gray-300">
                  {e.latitude}, {e.longitude}
                </td>
                <td className="px-2 border border-gray-300">
                  {e.nature_of_business}
                </td>
                <td className="px-2 text-center border border-gray-300">
                  {e.year_established}
                </td>
                <td className="relative w-20 p-1 text-center border border-gray-300">
                  <div className="flex justify-center gap-2">
                    {canEditEstablishments && (
                      <button
                        onClick={() => onEdit(e)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                        title="Edit"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => onPolygon(e)}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
                      title="Polygon"
                    >
                      <Map size={14} />
                      Polygon
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Establishments Export Report"
        fileName="establishments_export"
        companyName="DENR Environmental Office"
        companySubtitle="Establishment Records System"
        logo="/logo.png" // optional: replace with your logo
        columns={[
          "Name",
          "Address",
          "Coordinates",
          "Nature of Business",
          "Year Established",
        ]}
        rows={selectedEstablishments.map((id) => {
          const e = establishments.find((x) => x.id === id);
          return [
            e.name,
            `${e.street_building}, ${e.barangay}, ${e.city}, ${e.province}, ${e.postal_code}`,
            `Lat: ${e.latitude}, Lng: ${e.longitude}`,
            e.nature_of_business,
            e.year_established,
          ];
        })}
      />
    </div>
  );
}
