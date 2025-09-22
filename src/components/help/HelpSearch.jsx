import { useState } from "react";

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

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search help topics..."
        className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
      />

      {showSuggestions && value && (
        <ul className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
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
