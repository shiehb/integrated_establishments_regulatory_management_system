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
    <aside className="w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-4 py-3">
        <h2 className="text-lg font-bold text-white">Quick Navigation</h2>
      </div>
      
      <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {/* Show All Button */}
          <li>
            <button
              onClick={() => {
                onShowAll();
                setOpenCategory(null);
              }}
              className="w-full px-3 py-2.5 font-medium text-left rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors shadow-sm"
            >
              📚 Show All Topics
            </button>
          </li>

          {/* Categories */}
          {categories.map((cat) => (
            <li key={cat.name}>
              <button
                className="flex items-center justify-between w-full px-3 py-2.5 text-left rounded-lg hover:bg-gray-50 transition-colors group"
                onClick={() => toggleCategory(cat.name)}
              >
                <span className="font-semibold text-gray-800 group-hover:text-sky-700">
                  {cat.name}
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-sky-100 text-sky-700 rounded-full">
                    {cat.items.length}
                  </span>
                </span>
                {openCategory === cat.name ? (
                  <ChevronDown className="w-4 h-4 text-sky-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Category Topics */}
              {openCategory === cat.name && (
                <ul className="mt-2 ml-4 space-y-1.5 border-l-2 border-sky-200 pl-3">
                  {cat.items.map((item) => (
                    <li key={item.id}>
                      <button
                        ref={activeId === item.id ? activeRef : null}
                        onClick={() => onSelect(item)}
                        className={`text-sm text-left w-full px-2 py-1.5 rounded transition-colors ${
                          activeId === item.id
                            ? "font-semibold text-sky-700 bg-sky-50"
                            : "text-gray-600 hover:text-sky-600 hover:bg-gray-50"
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

        {/* Quick Stats */}
        <div className="mt-6 p-3 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg border border-sky-200">
          <p className="text-xs font-medium text-sky-700 mb-1">📊 Help Stats</p>
          <p className="text-xs text-gray-600">
            {categories.reduce((sum, cat) => sum + cat.items.length, 0)} total topics across {categories.length} categories
          </p>
        </div>
      </div>
    </aside>
  );
}
