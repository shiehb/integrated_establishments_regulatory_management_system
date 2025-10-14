import { useState, useEffect } from "react";
import { helpCategories } from "../../data/helpCategories";
import { ChevronDown, ChevronRight, Link as LinkIcon, Check } from "lucide-react";

export default function HelpSection({ topics, activeId, setActiveId }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [openTopics, setOpenTopics] = useState([]);
  const [copiedLink, setCopiedLink] = useState(null);

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
    
    // Scroll to topic with smooth behavior
    setTimeout(() => {
      const element = document.getElementById(`topic-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Copy link to clipboard
  const copyTopicLink = (id, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#topic-${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(id);
      setTimeout(() => setCopiedLink(null), 2000);
    });
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
            <section key={cat.key} id={`category-${cat.key}`} className="bg-white rounded-xl shadow-md border border-gray-200">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat.key)}
                className="flex items-center justify-between w-full px-6 py-4 font-semibold text-left bg-gradient-to-r from-sky-50 to-sky-100 rounded-t-xl text-sky-700 hover:from-sky-100 hover:to-sky-200 transition-all"
              >
                <span className="text-lg">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-sky-600">
                    {cat.items.length} {cat.items.length === 1 ? 'topic' : 'topics'}
                  </span>
                {openCategory === cat.key ? (
                    <ChevronDown className="w-5 h-5" />
                ) : (
                    <ChevronRight className="w-5 h-5" />
                )}
                </div>
              </button>

              {/* Topics inside category */}
              {openCategory === cat.key && (
                <ul className="p-4 space-y-3">
                  {cat.items.map((topic) => {
                    const isOpen = openTopics.includes(topic.id);
                    return (
                      <li
                        key={topic.id}
                        id={`topic-${topic.id}`}
                        className="bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:border-sky-300 transition-all"
                      >
                        {/* Topic header */}
                        <div className="flex items-center justify-between p-4">
                        <button
                          onClick={() => toggleTopic(topic.id)}
                            className="flex-1 flex items-center justify-between font-semibold text-left text-gray-800 hover:text-sky-700"
                        >
                            <span className="text-base">{topic.title}</span>
                          {isOpen ? (
                              <ChevronDown className="w-5 h-5 ml-2" />
                          ) : (
                              <ChevronRight className="w-5 h-5 ml-2" />
                          )}
                        </button>
                          
                          {/* Copy Link Button */}
                          <button
                            onClick={(e) => copyTopicLink(topic.id, e)}
                            className="ml-2 p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            title="Copy link to this topic"
                          >
                            {copiedLink === topic.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <LinkIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Dropdown content */}
                        {isOpen && (
                          <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                              {topic.description}
                            </p>
                            
                            {/* Steps with improved styling */}
                            <div className="space-y-5">
                              {topic.steps.map((step, idx) => (
                                <div
                                  key={idx}
                                  id={`topic-${topic.id}-step-${idx + 1}`}
                                  className="border-l-4 border-sky-500 pl-4"
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Step number badge */}
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-700 text-sm font-bold flex-shrink-0">
                                      {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-800 text-base mb-2">
                                    {step.title}
                                      </h4>
                                  {step.description && (
                                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                      {step.description}
                                    </p>
                                  )}
                                  {step.image && (
                                        <div className="mt-3">
                                      <img
                                        src={step.image}
                                        alt={step.title}
                                            className="rounded-lg border border-gray-200 w-full max-w-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                            }}
                                            onClick={(e) => {
                                              // Could add lightbox here
                                              window.open(e.target.src, '_blank');
                                            }}
                                      />
                                    </div>
                                  )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
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
