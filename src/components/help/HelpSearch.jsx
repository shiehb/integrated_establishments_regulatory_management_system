import { useState } from "react";
import { Search, X } from "lucide-react";

export default function HelpSearch({ topics, onSearch, value, setValue }) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    setShowSuggestions(true);
    onSearch(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      onSearch(value, true); // expand first match
    }
  };

  const filteredSuggestions = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(value.toLowerCase()) ||
      topic.description.toLowerCase().includes(value.toLowerCase())
  );

  const handleSelect = (title) => {
    setValue(title);
    setShowSuggestions(false);
    onSearch(title, true); // expand selected match
  };

  const handleClear = () => {
    setValue("");
    setShowSuggestions(false);
    onSearch("", false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Search Icon */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search help topics..."
          className="w-full border border-gray-300 pl-10 pr-10 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4 text-sky-700 hover:text-gray-600" />
          </button>
        )}
      </div>

      {showSuggestions && value && (
        <ul className="absolute left-0 right-0 mt-4 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((topic) => (
              <li
                key={topic.id}
                onClick={() => handleSelect(topic.title)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 cursor-pointer"
              >
                {topic.title}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-gray-500 italic">
              No results found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
