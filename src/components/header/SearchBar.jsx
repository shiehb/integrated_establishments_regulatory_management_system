// src/components/header/SearchBar.jsx
import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useSearch } from "../../contexts/SearchContext";

export default function SearchBar() {
  const {
    searchQuery,
    updateSearchQuery,
    searchSuggestions,
    showSuggestions,
    hideSuggestions,
    selectSuggestion,
    loading,
  } = useSearch();

  const searchContainerRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(event.target)
        ) {
          hideSuggestions();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hideSuggestions]);

  const handleGlobalSearch = (e) => {
    updateSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2 && searchSuggestions.length > 0) {
      // Suggestions will show automatically via the context
    }
  };

  const handleSuggestionClick = (suggestion) => {
    selectSuggestion(suggestion);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case "establishment":
        return <Search className="w-4 h-4" />;
      case "user":
        return <Search className="w-4 h-4" />;
      case "inspection":
        return <Search className="w-4 h-4" />;
      case "popular":
        return <Search className="w-4 h-4" />;
      case "suggestion":
        return <Search className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case "establishment":
        return "text-blue-600 bg-blue-50";
      case "user":
        return "text-green-600 bg-green-50";
      case "inspection":
        return "text-purple-600 bg-purple-50";
      case "popular":
        return "text-orange-600 bg-orange-50";
      case "suggestion":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="flex-1 max-w-md relative" ref={searchContainerRef}>
      <div className="relative">
        <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder="Search establishments, users, inspections..."
          value={searchQuery}
          onChange={handleGlobalSearch}
          onFocus={handleInputFocus}
          className="w-full py-1 pl-10 pr-4 transition bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
        {loading && (
          <Loader2 className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2 animate-spin" />
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
              Search Suggestions{" "}
              {searchSuggestions.length > 0 &&
                `(${searchSuggestions.length})`}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                <span className="ml-2 text-sm text-gray-600">
                  Loading suggestions...
                </span>
              </div>
            ) : searchSuggestions.length > 0 ? (
              searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center w-full p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-1 text-left"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${getSuggestionColor(
                      suggestion.type
                    )} mr-3`}
                  >
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.name || suggestion.text}
                    </div>
                    {suggestion.description && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {suggestion.description}
                      </div>
                    )}
                    {suggestion.category && (
                      <div className="text-xs text-gray-400 mt-1">
                        {suggestion.category}
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-4 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No suggestions found</p>
                <p className="text-xs mt-1">Try different keywords</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
