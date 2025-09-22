import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function HelpSidebar({
  categories,
  onSelect,
  onShowAll,
  activeId,
}) {
  const [openCategory, setOpenCategory] = useState(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (!activeId) return;
    const category = categories.find((cat) =>
      cat.items.some((item) => item.id === activeId)
    );
    if (category) setOpenCategory(category.name);
  }, [activeId, categories]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeId]);

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <aside
      className="
        w-64 bg-white border-r border-gray-200
        sticky top-20
        flex flex-col
        max-h-[calc(100vh-5rem)]
      "
    >
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold text-sky-700 mb-4">Categories</h2>

        <ul className="space-y-2">
          {/* Show All Button */}
          <li>
            <button
              onClick={() => {
                onShowAll();
                setOpenCategory(null);
              }}
              className="w-full text-left px-2 py-2 rounded bg-sky-50 text-sky-700 font-medium hover:bg-sky-100"
            >
              Show All Topics
            </button>
          </li>

          {categories.map((cat) => (
            <li key={cat.name}>
              <button
                className="flex items-center justify-between w-full text-left px-2 py-2 rounded hover:bg-gray-100"
                onClick={() => toggleCategory(cat.name)}
              >
                <span className="font-medium text-gray-700">
                  {cat.name}{" "}
                  <span className="ml-1 text-xs text-gray-500">
                    ({cat.items.length})
                  </span>
                </span>
                {openCategory === cat.name ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {openCategory === cat.name && (
                <ul className="ml-4 mt-2 space-y-1">
                  {cat.items.map((item) => (
                    <li key={item.id}>
                      <button
                        ref={activeId === item.id ? activeRef : null}
                        onClick={() => onSelect(item)}
                        className={`text-sm hover:text-sky-600 hover:underline ${
                          activeId === item.id
                            ? "font-semibold text-sky-700"
                            : "text-gray-600"
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
