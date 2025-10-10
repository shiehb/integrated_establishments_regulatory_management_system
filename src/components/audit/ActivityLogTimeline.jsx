import { useState, useRef } from "react";
import { Plus, Pencil, LogIn, LogOut, Info, Filter } from "lucide-react";

export default function ActivityLogTimeline({ activityLog }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionFilter, setActionFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quickDate, setQuickDate] = useState("all");

  const filterTimeout = useRef(null);

  const now = new Date();
  const getQuickDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (quickDate === "today") return { from: today, to: now };
    if (quickDate === "yesterday") {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      return { from: y, to: new Date(today.getTime() - 1) };
    }
    if (quickDate === "week") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { from: startOfWeek, to: now };
    }
    if (quickDate === "month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: startOfMonth, to: now };
    }
    return null;
  };

  const quickRange = getQuickDateRange();

  // 🔹 Filtering logs
  const filteredLogs = activityLog
    .filter((log) =>
      actionFilter.length > 0 ? actionFilter.includes(log.action) : true
    )
    .filter((log) => {
      const logDate = new Date(log.created_at);
      if (quickRange)
        return logDate >= quickRange.from && logDate <= quickRange.to;
      if (dateFrom && logDate < new Date(dateFrom)) return false;
      if (dateTo && logDate > new Date(dateTo)) return false;
      return true;
    });

  // 🔹 Icons per action
  const actionStyles = {
    create: { icon: <Plus size={14} />, color: "text-green-600 bg-green-100" },
    update: { icon: <Pencil size={14} />, color: "text-blue-600 bg-blue-100" },
    login: { icon: <LogIn size={14} />, color: "text-sky-600 bg-sky-100" },
    logout: { icon: <LogOut size={14} />, color: "text-gray-600 bg-gray-100" },
    other: { icon: <Info size={14} />, color: "text-gray-500 bg-gray-100" },
  };

  const toggleAction = (action) =>
    setActionFilter((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );

  return (
    <div className="flex flex-col w-full h-[calc(100vh-158px)] bg-white border-l">
      {/* Header + Filter button */}
      <div className="flex items-center justify-between p-2 shadow-md">
        <h2 className="text-lg font-semibold text-sky-700">Activity Log</h2>

        <div className="relative">
          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
          >
            <Filter size={14} /> Filters
          </button>

          {filtersOpen && (
            <div
              className="absolute right-0 top-full z-20 p-3 mt-2 bg-white border rounded shadow w-80"
              onMouseEnter={() =>
                filterTimeout.current && clearTimeout(filterTimeout.current)
              }
              onMouseLeave={() => {
                filterTimeout.current = setTimeout(
                  () => setFiltersOpen(false),
                  300
                );
              }}
            >
              {/* Header + Clear */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-sky-700">Filters</h4>
                <button
                  onClick={() => {
                    setActionFilter([]);
                    setDateFrom("");
                    setDateTo("");
                    setQuickDate("all");
                  }}
                  className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Clear All
                </button>
              </div>

              {/* Actions */}
              <h4 className="mb-1 text-sm font-semibold">Actions</h4>
              {["create", "update", "login", "logout"].map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={actionFilter.includes(a)}
                    onChange={() => toggleAction(a)}
                  />
                  <span className="capitalize">{a}</span>
                </label>
              ))}

              {/* Quick Dates */}
              <h4 className="mt-3 mb-1 text-sm font-semibold">Quick Dates</h4>
              <div className="flex flex-wrap gap-2">
                {["today", "yesterday", "week", "month"].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setQuickDate(d);
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      quickDate === d
                        ? "bg-sky-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {d === "today"
                      ? "Today"
                      : d === "yesterday"
                      ? "Yesterday"
                      : d === "week"
                      ? "This Week"
                      : "This Month"}
                  </button>
                ))}
              </div>

              {/* Custom Range */}
              <h4 className="mt-3 mb-1 text-sm font-semibold">Custom Range</h4>
              <div className="flex items-center gap-2 text-sm">
                <label className="flex flex-col flex-1">
                  From
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setQuickDate("all");
                    }}
                    className="px-2 py-1 mt-1 border rounded"
                  />
                </label>
                <label className="flex flex-col flex-1">
                  To
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setQuickDate("all");
                    }}
                    className="px-2 py-1 mt-1 border rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto h-[calc(100vh-150px)]">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const date = new Date(log.created_at);
                const { icon, color } =
                  actionStyles[log.action] || actionStyles.other;

                return (
                  <tr
                    key={log.id}
                    className="transition border-b border-gray-200 hover:bg-gray-100"
                  >
                    {/* Date + Time */}
                    <td className="px-3 py-1 text-gray-600 w-15 whitespace-nowrap">
                      <div className="font-medium">
                        {date.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Action + Message */}
                    <td className="px-3 py-1">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${color}`}
                        >
                          {icon} {log.action}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700">{log.message}</div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="px-3 py-4 italic text-center text-gray-500"
                >
                  No activity found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
