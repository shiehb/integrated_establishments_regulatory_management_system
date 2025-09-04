import { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil, Plus } from "lucide-react";

export default function EstablishmentList({ onAdd, onEdit }) {
  const [establishments] = useState([
    {
      id: 1,
      name: "SAMPLE ESTABLISHMENT",
      natureOfBusiness: "RETAIL",
      yearEstablished: "2020",
      address: {
        province: "METRO MANILA",
        city: "QUEZON CITY",
        barangay: "SANDY",
        street: "123 MAIN ST",
        postalCode: "1100",
      },
      coordinates: {
        latitude: "14.6760",
        longitude: "121.0437",
      },
      active: true,
    },
    {
      id: 2,
      name: "ANOTHER ESTABLISHMENT",
      natureOfBusiness: "WHOLESALE",
      yearEstablished: "2018",
      address: {
        province: "LAGUNA",
        city: "SAN PABLO",
        barangay: "BAGONG SILANG",
        street: "456 SECOND ST",
        postalCode: "4000",
      },
      coordinates: {
        latitude: "14.0668",
        longitude: "121.3260",
      },
      active: false,
    },
  ]);

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-sky-600">Establishments</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-2 py-2 text-white rounded-lg bg-sky-600 hover:bg-sky-700"
        >
          <Plus size={18} /> Add Establishment
        </button>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="text-sm text-center text-white bg-sky-700">
            <th className="p-1 border border-gray-300">Name</th>
            <th className="p-1 border border-gray-300">Nature of Business</th>
            <th className="p-1 border border-gray-300">Year Established</th>
            <th className="p-1 border border-gray-300">Address</th>
            <th className="p-1 border border-gray-300">Coordinates</th>
            <th className="p-1 text-right border border-gray-300"></th>
          </tr>
        </thead>
        <tbody>
          {establishments.map((e) => (
            <tr
              key={e.id}
              className="p-1 text-xs border border-gray-300 hover:bg-gray-50"
            >
              <td className="px-2 border border-gray-300">{e.name}</td>
              <td className="px-2 border border-gray-300">
                {e.natureOfBusiness}
              </td>
              <td className="px-2 text-center border border-gray-300">
                {e.yearEstablished}
              </td>
              <td className="px-2 border border-gray-300">
                {e.address.street}, {e.address.barangay}, {e.address.city},{" "}
                {e.address.province}, {e.address.postalCode}
              </td>
              <td className="px-2 text-center border border-gray-300">
                {e.coordinates.latitude}, {e.coordinates.longitude}
              </td>
              <td className="relative w-16 p-1 text-center border border-gray-300">
                <button
                  onClick={() => onEdit(e)}
                  className="flex items-center gap-2 px-2 py-1 hover:text-sky-700 rounded hover:bg-gray-200"
                  title="Edit"
                >
                  <Pencil size={16} />
                  <span>Edit</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Dropdown Menu Component */
function Menu({ establishment, onEdit }) {
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
        className="p-1 text-black bg-transparent rounded-full hover:bg-gray-200"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 w-20 mt-2 bg-white border shadow-lg">
          <button
            onClick={() => {
              onEdit(establishment);
              setOpen(false);
            }}
            className="flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-gray-200 hover:text-gray-600"
          >
            <Pencil size={16} />
            <span>Edit</span>
          </button>
        </div>
      )}
    </div>
  );
}
