import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  globalSearch,
  getSearchOptions,
  getSearchSuggestions,
} from "../services/api";

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    establishments: [],
    users: [],
    inspections: [],
    suggestions: [],
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [options, setOptions] = useState({
    municipalities: [],
    sectors: [],
    risk_levels: [],
  });
  const [loading, setLoading] = useState(false);

  const searchDebounceRef = useRef(null);
  const suggestionsDebounceRef = useRef(null);
  const location = useLocation();

  // Clear search when navigating to different pages
  useEffect(() => {
    setSearchQuery("");
    setSearchResults({
      establishments: [],
      users: [],
      inspections: [],
      suggestions: [],
    });
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setIsSearching(false);
  }, [location.pathname]);

  // Load filter options only when user is authenticated
  useEffect(() => {
    const fetchSearchOptions = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        const data = await getSearchOptions();
        setOptions(data);
      } catch (error) {
        console.error("Failed to fetch search options:", error);
      }
    };

    fetchSearchOptions();
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getSearchSuggestions(query);
      setSearchSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch search suggestions:", error);
      setSearchSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchQuery = (query) => {
    setSearchQuery(query);
    const active = query.length > 0;
    setIsSearching(active);

    // Clear previous debounce timers
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (suggestionsDebounceRef.current)
      clearTimeout(suggestionsDebounceRef.current);

    // Show suggestions when typing (after 2 characters)
    if (query.length >= 2) {
      setShowSuggestions(true);
      // Debounce suggestions API (300ms)
      suggestionsDebounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }

    // Only search if user is authenticated and query is not empty
    const token = localStorage.getItem("access");
    if (!token || !query) {
      setSearchResults({
        establishments: [],
        users: [],
        inspections: [],
        suggestions: [],
      });
      return;
    }

    // Debounce main search API (500ms) - only if query is long enough
    if (query.length >= 2) {
      searchDebounceRef.current = setTimeout(() => {
        runSearch(query);
      }, 500);
    }
  };

  const updateSearchResults = (type, results) => {
    setSearchResults((prev) => ({
      ...prev,
      [type]: results,
    }));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults({
      establishments: [],
      users: [],
      inspections: [],
      suggestions: [],
    });
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setIsSearching(false);

    // Clear any pending debounce timers
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (suggestionsDebounceRef.current)
      clearTimeout(suggestionsDebounceRef.current);
  };

  // FIXED: Added a proper hideSuggestions function with a small delay
  const hideSuggestions = () => {
    setShowSuggestions(false);
  };

  const selectSuggestion = (suggestion) => {
    const searchText = suggestion.name || suggestion.text || "";
    setSearchQuery(searchText);

    // Small delay before hiding to ensure the click is registered
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);

    // Trigger search with the selected suggestion
    if (searchText) {
      runSearch(searchText);
    }
  };

  const runSearch = async (query) => {
    const token = localStorage.getItem("access");
    if (!token || !query) {
      return;
    }

    try {
      setLoading(true);
      const data = await globalSearch({ q: query });
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      if (error.response?.status === 401) {
        setSearchResults({
          establishments: [],
          users: [],
          inspections: [],
          suggestions: [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOptions = (newOptions) => {
    setOptions(newOptions);
  };

  const value = {
    searchQuery,
    searchResults,
    searchSuggestions,
    isSearching,
    showSuggestions,
    loading,
    options,
    updateSearchQuery,
    updateSearchResults,
    updateOptions,
    clearSearch,
    hideSuggestions,
    selectSuggestion,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
