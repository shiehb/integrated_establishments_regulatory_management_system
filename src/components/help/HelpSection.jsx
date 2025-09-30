import { useState, useEffect } from "react";
import { helpCategories } from "../../data/helpCategories";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function HelpSection({ topics, activeId, setActiveId }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [openTopics, setOpenTopics] = useState([]);

  // Toggle category (only one open at a time)
  const toggleCategory = (key) => {
    setOpenCategory((prev) => (prev === key ? null : key));
    setOpenTopics([]); // reset topics when switching category
  };

  // Toggle topic (multiple allowed inside one category)
  const toggleTopic = (id) => {
    setOpenTopics((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
    setActiveId(id);
  };

  // Auto-open when sidebar/search selects a topic
  useEffect(() => {
    if (activeId) {
      const topic = topics.find((t) => t.id === activeId);
      if (topic) {
        setOpenCategory(topic.category); // open its category
        setOpenTopics((prev) =>
          prev.includes(activeId) ? prev : [...prev, activeId]
        ); // open its dropdown
      }
    }
  }, [activeId, topics]);

  // Group topics by category
  const grouped = helpCategories.map((cat) => ({
    ...cat,
    items: topics.filter((t) => t.category === cat.key),
  }));

  return (
    <div className="space-y-6">
      {grouped.map(
        (cat) =>
          cat.items.length > 0 && (
            <section key={cat.key} className="bg-white rounded shadow-sm ">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat.key)}
                className="flex items-center justify-between w-full px-4 py-3 mt-4 font-semibold text-left bg-gray-100 rounded-t-lg text-sky-700 hover:bg-gray-200"
              >
                <span>{cat.name}</span>
                {openCategory === cat.key ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Topics inside category */}
              {openCategory === cat.key && (
                <ul className="p-4 space-y-2">
                  {cat.items.map((topic) => {
                    const isOpen = openTopics.includes(topic.id);
                    return (
                      <li
                        key={topic.id}
                        className="bg-white border rounded-md shadow-sm"
                      >
                        {/* Topic header */}
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className="flex items-center justify-between w-full px-4 py-2 font-medium text-left text-gray-800 hover:bg-gray-50"
                        >
                          <span>{topic.title}</span>
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </button>

                        {/* Dropdown content */}
                        {isOpen && (
                          <div className="px-6 pb-4 space-y-3 text-gray-700">
                            <p className="text-sm italic text-gray-600">
                              {topic.description}
                            </p>
                            <ol className="space-y-2 list-decimal list-inside">
                              {topic.steps.map((step, idx) => (
                                <li key={idx}>
                                  <span className="font-medium">
                                    {step.title}
                                  </span>
                                  {step.description && (
                                    <p className="ml-4 text-sm text-gray-600">
                                      {step.description}
                                    </p>
                                  )}
                                  {step.image && (
                                    <div className="flex justify-center mt-2 ">
                                      {" "}
                                      {/* Added container for centering */}
                                      <img
                                        src={step.image}
                                        alt={step.title}
                                        className="object-contain border rounded-md max-h-80" /* Added max-h-80 and object-contain */
                                      />
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )
      )}
    </div>
  );
}
