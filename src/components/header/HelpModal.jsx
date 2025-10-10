// src/components/header/HelpModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, HelpCircle, X } from "lucide-react";
import { helpTopics } from "../../data/helpData";
import { filterTopicsByUserLevel, normalizeUserLevel } from "../../utils/helpUtils";

export default function HelpModal({ userLevel = "public" }) {
  const navigate = useNavigate();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSearchQuery, setHelpSearchQuery] = useState("");

  const handleHelpSearch = (e) => setHelpSearchQuery(e.target.value);

  const accessibleTopics = filterTopicsByUserLevel(
    helpTopics,
    normalizeUserLevel(userLevel)
  );
  
  const filteredHelpSuggestions = accessibleTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(helpSearchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(helpSearchQuery.toLowerCase())
  );

  const handleHelpSuggestionClick = (topicTitle) => {
    setShowHelpModal(false);
    navigate(`/help?query=${encodeURIComponent(topicTitle)}`);
  };

  return (
    <>
      {/* Floating Help Bubble (bottom-right) */}
      <button
        onClick={() => setShowHelpModal(true)}
        className="fixed z-40 flex items-center justify-center w-8 h-8 transition-all duration-200 rounded-full shadow-lg bottom-4 right-4 bg-sky-600 hover:bg-sky-700 hover:scale-105"
        title="Help"
      >
        <HelpCircle className="text-white w-7 h-7" />
      </button>

      {/* Help Modal (bottom-right widget) */}
      {showHelpModal && (
        <div className="fixed z-50 bottom-4 right-4">
          <div className="w-100 max-h-[60vh] min-h-[50vh] flex flex-col p-2 bg-white rounded border border-gray-500 relative">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 rounded-t-lg bg-sky-50">
              <h2 className="flex items-center text-lg font-semibold text-sky-700">
                <HelpCircle className="w-5 h-5 mr-2" />
                Help Center
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 transition-colors rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search bar */}
            <div className="p-2">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={helpSearchQuery}
                  onChange={handleHelpSearch}
                  className="w-full py-1 pl-10 pr-4 transition bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto border-t border-gray-200">
              <div className="p-2">
                {filteredHelpSuggestions.length > 0 ? (
                  <ul className="space-y-1">
                    {filteredHelpSuggestions.map((topic) => (
                      <li
                        key={topic.id}
                        onClick={() => handleHelpSuggestionClick(topic.title)}
                        className="p-1 transition-colors border border-transparent rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-200"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {topic.title}
                        </div>
                        <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {topic.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No help topics found</p>
                    {helpSearchQuery && (
                      <p className="mt-1 text-xs">Try different keywords</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowHelpModal(false);
                  navigate("/help");
                }}
                className="flex items-center justify-center w-full py-2 text-sm font-medium transition-colors rounded-lg text-sky-600 hover:text-sky-700 hover:bg-sky-50"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Open Full Help Page
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
