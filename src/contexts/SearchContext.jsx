import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [error, setError] = useState(null);

  const searchDebounceRef = useRef(null);
  const suggestionsDebounceRef = useRef(null);
  const searchCacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Clear search when navigating to different pages (but not when coming from search)
  useEffect(() => {
    // Don't clear if we're navigating from search with highlight state
    if (location.state?.highlightId && location.state?.fromSearch) {
      return;
    }
    
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
  }, [location.pathname, location.state]);

  // Load filter options, search history, and saved searches
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

    // Load search history from localStorage
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse search history:", error);
      }
    }

    // Load saved searches from localStorage
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved searches:', e);
      }
    }

    fetchSearchOptions();
  }, []);

  const fetchSuggestions = async (query, userLevel = "public") => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Check cache first
    const cacheKey = `${query}-${userLevel}`;
    if (searchCacheRef.current.has(cacheKey)) {
      setSearchSuggestions(searchCacheRef.current.get(cacheKey));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add role-based filtering to suggestions
      const suggestionParams = { q: query };
      if (userLevel !== "public") {
        suggestionParams.role = userLevel;
      }
      
      const data = await getSearchSuggestions(suggestionParams);
      
      // Cache results
      searchCacheRef.current.set(cacheKey, data.suggestions || []);
      
      // Limit cache size to 50 entries
      if (searchCacheRef.current.size > 50) {
        const firstKey = searchCacheRef.current.keys().next().value;
        searchCacheRef.current.delete(firstKey);
      }
      
      setSearchSuggestions(data.suggestions || []);
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      if (error.response?.status === 429) {
        setError('Too many searches. Please wait a moment.');
      } else if (!navigator.onLine) {
        setError('No internet connection.');
      } else {
        setError('Search failed. Please try again.');
      }
      
      console.error("Failed to fetch search suggestions:", error);
      setSearchSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Add query to search history
  const addToHistory = (query) => {
    if (query && query.trim().length > 0) {
      const trimmedQuery = query.trim();
      const newHistory = [trimmedQuery, ...searchHistory.filter(item => item !== trimmedQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  const updateSearchQuery = (query, userLevel = "public") => {
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
        fetchSuggestions(query, userLevel); // Pass userLevel
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
        runSearch(query, userLevel); // Pass userLevel
        // Add to history when performing search
        addToHistory(query);
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
    console.log('Selecting suggestion:', suggestion);
    const searchText = suggestion.name || suggestion.text || "";
    setSearchQuery(searchText);

    // Determine navigation path based on suggestion type
    const path = suggestion.path || (
      suggestion.type === 'user' ? '/users' :
      suggestion.type === 'establishment' ? '/establishments' :
      suggestion.type === 'inspection' ? '/inspections' : '/'
    );
    
    // For navigation items, just navigate without highlight
    if (suggestion.type === 'navigation') {
      console.log('Navigating to page:', path);
      navigate(path);
      setShowSuggestions(false);
      return;
    }
    
    console.log('Navigating to:', path, 'with state:', {
      highlightId: suggestion.id,
      entityType: suggestion.type,
      fromSearch: true
    });
    
    // Set selected result for tracking
    setSelectedSearchResult(suggestion);
    
    // Navigate with state for highlighting
    navigate(path, { 
      state: { 
        highlightId: suggestion.id,
        entityType: suggestion.type,
        fromSearch: true // Add flag to prevent search clearing
      },
      replace: false
    });
    
    // Hide suggestions
    setShowSuggestions(false);

    // Trigger search with the selected suggestion
    if (searchText) {
      runSearch(searchText);
    }
  };

  const runSearch = async (query, userLevel = "public") => {
    const token = localStorage.getItem("access");
    if (!token || !query) {
      return;
    }

    try {
      setLoading(true);
      
      // Add role-based filtering to search parameters
      const searchParams = { q: query };
      
      // Add role-specific filters
      if (userLevel !== "public") {
        searchParams.role = userLevel;
      }
      
      // Filter search based on user permissions
      if (["public", "Inspector"].includes(userLevel)) {
        // Limited search for public and inspector users
        searchParams.scope = "limited";
      }
      
      const data = await globalSearch(searchParams);
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

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Saved searches functions
  const saveSearch = (query, name = '') => {
    if (!query) return;
    
    const newSearch = {
      id: Date.now(),
      name: name || query,
      query,
      timestamp: new Date().toISOString()
    };
    
    const updated = [newSearch, ...savedSearches.filter(s => s.query !== query)].slice(0, 20);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    
    return newSearch;
  };

  const deleteSavedSearch = (id) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const loadSavedSearch = (search) => {
    updateSearchQuery(search.query);
  };

  const value = {
    searchQuery,
    searchResults,
    searchSuggestions,
    searchHistory,
    savedSearches,
    selectedSearchResult,
    error,
    isSearching,
    showSuggestions,
    loading,
    options,
    updateSearchQuery,
    updateSearchResults,
    updateOptions,
    clearSearch,
    clearHistory,
    hideSuggestions,
    selectSuggestion,
    saveSearch,
    deleteSavedSearch,
    loadSavedSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
